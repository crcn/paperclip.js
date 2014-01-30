Tokenizer  = require "./tokenizer"
TokenCodes = Tokenizer.codes 
BaseParser = require "../base/parser"

FnExpression         = require "./expressions/fn"
JsExpression         = require "./expressions/js"
RefExpression        = require "./expressions/ref"
GroupExpression      = require "./expressions/group"
ParamsExpression     = require "./expressions/params"
StringExpression     = require "./expressions/string"
ScriptExpression     = require "./expressions/script"
OptionExpression     = require "./expressions/option"
ScriptsExpression    = require "./expressions/scripts"
OptionsExpression    = require "./expressions/options"
RefPathExpression    = require "./expressions/refPath"
ModifierExpression   = require "./expressions/modifier"
CollectionExpression = require "../base/collectionExpression"

###
 action: 
###

class Parser extends BaseParser

  ###
  ###

  constructor: () ->
    super new Tokenizer()

  ###
  ###

  _parse: () ->
    @_nextCode()
    @_parseActionsOrOptions()

  ###
  ###

  _parseActionsOrOptions: () ->
    actions = []

    isExpr = not (pn = @_t.peekNext()) or pn[0] isnt TokenCodes.COLON

    if @_t.current[0] is TokenCodes.BS
      @_nextCode()
      isExpr = false

    # not a colon? actions aren't provided
    if isExpr
      return new ScriptExpression undefined, @_parseActionOptions()


    while @_t.current
      actions.push @_parseAction()
      if @_currentCode() is TokenCodes.COMA
        @_nextCode()
    
    new ScriptsExpression actions

  ###
  ###

  _parseAction: () ->
    name = @_currentString()
    @_nextCode() # eat name
    @_nextCode() # eat :
    new ScriptExpression name, @_parseActionOptions()

  ###
  ###

  _parseActionOptions: () ->  
    switch @_currentCode() 
      when TokenCodes.LB then @_parseMultiOptions()
      else @_parseReference()

  ###
  ###

  _parseMultiOptions: () ->
    options = []

    @_nextCode() # eat }


    while (c = @_currentCode()) isnt TokenCodes.RB
      
      name = @_currentString()

      @_expectNextCode TokenCodes.COLON

      @_nextCode()

      options.push new OptionExpression name, @_parseActionOptions()
      
      # coma? eat it. might also be a right bracket
      if @_currentCode() is TokenCodes.COMA
        @_nextCode()


    # get rid of RP
    @_nextCode()

    new OptionsExpression options

  ###
  ###

  _parseReference: () ->

    # references to watch
    expressions   = []
    modifiers     = []


    while c = @_currentCode()

      if c is TokenCodes.VAR or c is TokenCodes.U_VAR
        expressions.push @_parseRef()
        c = @_currentCode()

      if c is TokenCodes.LP
        expressions.push @_parseGroup()
        c = @_currentCode()

      if c is TokenCodes.LB
        expressions.push @_parseActionOptions()
        c = @_currentCode()

      if c is TokenCodes.STRING
        expressions.push new StringExpression @_currentString()
        c = @_nextCode()

      while c is TokenCodes.PIPE
        expressions.push @_parsePipe expressions.pop()
        c = @_currentCode()


      # end of multi statement
      if ~[TokenCodes.RP, TokenCodes.RB].indexOf c
        break

      if not c or ~[TokenCodes.COMA].indexOf c
        break

      expressions.push new JsExpression @_currentString()

      @_nextCode()

    return undefined unless expressions.length
    new CollectionExpression(expressions)

  ###
   filter item.name > 5, test;
  ###

  _parsePipe: (expressions) ->
    @_nextCode() # eat pipe |
    name = @_currentString()
    params = []
    @_nextCode()
    new ModifierExpression name, @_parseParams(), expressions

  ###
  ###

  _parseParams: () ->
    new ParamsExpression @_parseParams2()

  ###
  ###

  _parseParams2: () ->
    @_expectCurrentCode TokenCodes.LP

    params = []
    while c = @_nextCode()
      break if c is TokenCodes.RP

      params.push @_parseReference()
      c = @_currentCode()

      break if c isnt TokenCodes.COMA

    @_nextCode()

    params

  ###
  ###

  _parseGroup: () -> new GroupExpression @_parseParams2()

  ###
  ###

  _parseRef: () ->
    c = @_currentCode()
    refs = []
    assign = null

    if c is TokenCodes.U_VAR
      unbound = true
      c = @_nextCode()
    

    while c is TokenCodes.VAR
      name = @_currentString()

      c = @_nextCode()

      if c is TokenCodes.U_VAR
        c = @_nextCode()

      # function all
      if c is TokenCodes.LP
        refs.push new FnExpression name, @_parseParams()
        c = @_currentCode()
      else
        refs.push new RefExpression name

      if c is TokenCodes.DOT 
        c = @_nextCode()


    if c is TokenCodes.AS
      @_nextCode()
      castAs = @_currentString()
      @_nextCode()

    if c is TokenCodes.ASSIGN
      @_nextCode()
      assign = @_parseReference()

    new RefPathExpression refs, castAs, assign, unbound

module.exports = new Parser()
