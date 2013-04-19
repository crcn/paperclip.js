Tokenizer  = require "./tokenizer"
TokenCodes = Tokenizer.codes 

ModifierExpression = require "./expressions/modifier"
ScriptExpression   = require "./expressions/script"
ActionExpression   = require "./expressions/action"
ActionsExpression  = require "./expressions/actions"
OptionsExpression  = require "./expressions/options"
RefExpression      = require "./expressions/ref"
RefPathExpression  = require "./expressions/refPath"
FnExpression       = require "./expressions/fn"

###
 action: 
###

class Parser

  ###
  ###

  constructor: () ->
    @_t = new Tokenizer()
    @_expressions = {}

  ###
  ###

  parse: (source) ->
  
    if @_expressions[source] 
      return @_expressions[source]

    @_t.source source

    @_expressions[source] = @_parse()

  ###
  ###

  _parse: () ->
    switch @_nextCode()
      when TokenCodes.VAR then return @_parseActions()
      else @_error()

  ###
  ###

  _parseActions: () ->
    actions = []
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


    cpos = @_t.current[2] - @_t.current[1].length + 1

    while c = @_currentCode()

      if c is TokenCodes.VAR
        expressions.push @_parseRef()
        c = @_currentCode()

      if c is TokenCodes.LP
        @_parseParams()
        c = @_currentCode()

      if c is TokenCodes.LB
        @_parseBrackes()
        c = @_currentCode()

      # end of multi statement
      if ~[TokenCodes.RP, TokenCodes.RB].indexOf c
        break

      if not c or ~[TokenCodes.SEMI_COLON, TokenCodes.COMA, TokenCodes.PIPE].indexOf c
        break


      @_nextCode()

    pos = @_t._s.pos()

    @_t._s.pos cpos

    # a bit hacky, but we don't want a full JS parser - this
    # gets evaluated by the browser
    script = @_t._s.to (@_t.current?[2] or pos) - cpos
    @_t._s.pos pos

    # semi colon? skip it
    if @_currentCode() is TokenCodes.SEMI_COLON
      @_nextCode()

    modifiers = []

    # pipe? it's a modifier
    if @_currentCode() is TokenCodes.PIPE 
      modifiers.push @_parsePipes()


    new ScriptExpression script, expressions, modifiers

  ###
  ###

  _parsePipes: () ->
    buffer = []
    while (c = @_currentCode()) is TokenCodes.PIPE
      @_nextCode()
      buffer.push @_parsePipe()
    buffer

  ###
   filter item.name > 5, test;
  ###

  _parsePipe: () ->
    name = @_currentString()
    params = []
    @_nextCode()
    new ModifierExpression name, @_parseParams()


  ###
  ###

  _parseParams: () ->

    @_expectCurrentCode TokenCodes.LP
    params = []
    while c = @_nextCode()
      params.push @_parseActionOptions()
      c = @_currentCode()

      break if c isnt TokenCodes.COMA
      break if c is TokenCodes.RB

    @_nextCode()

    params



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

  _parseBrackes : () -> @_bufferUntil TokenCodes.LB, TokenCodes.RB

  ###
  ###

  _bufferUntil: (left, right) ->

    c = @_currentCode() 
    buffer = []
    while c and c isnt right
      buffer.push @_currentString()
      if (c = @_nextCode()) is left
        buffer.push @_bufferUntil left, right


    buffer.push @_currentString()
    @_nextCode() # skip it

    buffer.join ""


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
