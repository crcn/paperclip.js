Tokenizer  = require "./tokenizer"
TokenCodes = Tokenizer.codes 

ModifierExpression   = require "./expressions/modifier"
ScriptExpression     = require "./expressions/script"
ActionExpression     = require "./expressions/action"
ActionsExpression    = require "./expressions/actions"
OptionsExpression    = require "./expressions/options"
RefExpression        = require "./expressions/ref"
RefPathExpression    = require "./expressions/refPath"
FnExpression         = require "./expressions/fn"
JsExpression         = require "./expressions/js"
ParamsExpression     = require "./expressions/params"
CollectionExpression = require "./expressions/collection"
StringExpression     = require "./expressions/string"

###
 action: 
###

class Parser

  ###
  ###

  constructor: () ->
    @_t = new Tokenizer()

  ###
  ###

  parse: (source) ->
    @_t.source source
    @_parse()

  ###
  ###

  _parse: () ->
    switch @_nextCode()
      when TokenCodes.VAR then return @_parseActionsOrOptions()
      when TokenCodes.LB then return @_parseMultiOptions()
      else @_parseReference()

  ###
  ###

  _parseActionsOrOptions: () ->
    actions = []

    # not a colon? actions aren't provided
    if @_t._s.peek(1) isnt ":"
      return @_parseActionOptions()


    while @_t.current
      actions.push @_parseAction()
      if @_currentCode() is TokenCodes.SEMI_COLON
        @_nextCode()
    
    new ActionsExpression actions

  ###
  ###

  _parseAction: () ->
    name = @_currentString()
    @_expectNextCode TokenCodes.COLON
    @_nextCode()
    new ActionExpression name, @_parseActionOptions()

  ###
  ###

  _parseActionOptions: () ->
    switch @_currentCode() 
      when TokenCodes.LB then @_parseMultiOptions()
      else @_parseReference()

  ###
  ###

  _parseMultiOptions: () ->
    c = @_currentCode()
    options = []


    while c and (c = @_currentCode()) isnt TokenCodes.RB

      @_nextCode()

      ops = { name: @_currentString() }

      @_expectNextCode TokenCodes.COLON

      @_nextCode()
      ops.expression = @_parseActionOptions()
      options.push ops



    # get rid of RP
    @_nextCode()

    new OptionsExpression options




  ###
  ###

  _parseReference: () ->

    # references to watch
    expressions    = []
    modifiers     = []


    while c = @_currentCode()

      if c is TokenCodes.VAR
        expressions.push @_parseRef()
        c = @_currentCode()

      if c is TokenCodes.LP
        expressions.push @_parseParams()
        c = @_currentCode()

      if c is TokenCodes.LB
        expressions.push @_parseActionOptions()
        c = @_currentCode()

      if c is TokenCodes.STRING
        expressions.push new StringExpression @_currentString()
        c = @_nextCode()

      while c is TokenCodes.PIPE
        @_nextCode()
        expressions.push @_parsePipe expressions.pop()
        c = @_currentCode()


      # end of multi statement
      if ~[TokenCodes.RP, TokenCodes.RB].indexOf c
        break

      if not c or ~[TokenCodes.SEMI_COLON, TokenCodes.COMA].indexOf c
        break

      expressions.push new JsExpression @_currentString()

      @_nextCode()


    # semi colon? skip it
    if @_currentCode() is TokenCodes.SEMI_COLON
      @_nextCode()

    new ScriptExpression new CollectionExpression(expressions)

  ###
   filter item.name > 5, test;
  ###

  _parsePipe: (expressions) ->
    name = @_currentString()
    params = []
    @_nextCode()
    new ModifierExpression name, @_parseParams(), expressions

  ###
  ###

  _parseParams: () ->

    @_expectCurrentCode TokenCodes.LP
    params = []
    while c = @_nextCode()
      break if c is TokenCodes.RP

      params.push @_parseReference()
      c = @_currentCode()

      break if c isnt TokenCodes.COMA

    @_nextCode()

    new ParamsExpression params



  ###
  ###

  _parseRef: () ->
    c = @_currentCode()
    refs = []

    while c is TokenCodes.VAR
      name = @_currentString()

      # function all
      if (c = @_nextCode()) is TokenCodes.LP
        refs.push new FnExpression name, @_parseParams()
        c = @_currentCode()
      else
        refs.push new RefExpression name

      if c is TokenCodes.DOT 
        c = @_nextCode()

    new RefPathExpression refs

  ###
  ###

  _expectNextCode: (code) ->
    @_error() if @_t.next()[0] isnt code

  ###
  ###

  _expectCurrentCode: (code) ->
    @_error() if @_t.current[0] isnt code

  ###
  ###

  _nextCode: () -> @_t.next()?[0]

  ###
  ###

  _currentCode: () -> @_t.current?[0]

  ###
  ###

  _currentString: () -> @_t.current?[1]



  _error: () ->
    throw new Error "unexpected token #{TokenCodes.key(@_t.current[0])} '#{@_t.current[1]}' in '#{@_t.source()}'"

module.exports = Parser
