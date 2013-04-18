Tokenizer  = require "./tokenizer"
TokenCodes = Tokenizer.codes 

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
      when TokenCodes.WORD then @_parseAction()
      else @_error()

  ###
  ###

  _parseAction: () ->
    actionName = @_currentString()

    @_expectNextCode TokenCodes.COLON
    @_parseActionOptions()



  ###
  ###

  _parseActionOptions: () ->
    switch @_nextCode() 

      when TokenCodes.WS then @_parseActionOptions()

      # action: { }
      when TokenCodes.LB then @_parseOptions()

      # action: reference
      when TokenCodes.WORD then @_parseReference()

      # action: "string"
      when TokenCodes.STRING then @_parseString()
      else @_error()


  ###
  ###

  _parseReference: () ->
    @_t.putBack()
    c = @_currentCode()

    # references to watch
    refs   = []


    buffer = []

    while (c = @_nextCode()) and not ~[TokenCodes.RB, TokenCodes.COMA, TokenCodes.LB].indexOf c

      if c is TokenCodes.WORD
        buffer.push @_parseRef()

      if @_currentCode() is TokenCodes.WS
        continue

      buffer.push @_currentString()


    console.log buffer

  ###
  ###

  _parseRef: () ->
    c = @_currentCode()
    refs = []

    while c is TokenCodes.WORD
      name = @_t.current[1]

      # function all
      if (c = @_nextCode()) is TokenCodes.LP
        refs.push name + @_parseParams()
      else
        refs.push name

      if @_currentCode() is TokenCodes.DOT 
        c = @_nextCode()

    refs

  ###
  ###

  _parseParams: () ->
    c = @_currentCode() 
    buffer = []
    while c and c is TokenCodes.LP
      buffer.push @_t.current[1]
      if (c = @_nextCode()) is TokenCodes.LP 
        buffer.push @_parseParams()
      else if c is TokenCodes.RP
        buffer.push @_t.current[1]
        @_nextCode() # skip it
        break

    buffer.join ""

  ###
  ###

  _expectNextCode: (code) ->
    @_error() if @_t.next()[0] isnt code

  ###
  ###

  _nextCode: () -> @_t.next()?[0]

  ###
  ###

  _currentCode: () -> @_t.current[0]

  ###
  ###

  _currentString: () -> @_t.current[1]



  _error: () ->
    throw new Error "unexpected token #{TokenCodes.key(@_t.current[0])} '#{@_t.current[1]}' in '#{@_t.source()}'"

module.exports = Parser
