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
      when TokenCodes.WORD then @_parseActions()
      else @_error()

  ###
  ###

  _parseActions: () ->
    actions = []
    while @_t.current
      actions.push @_parseAction()
      if @_currentCode() is TokenCodes.SEMI_COLON
        @_nextCode()
    console.log JSON.stringify actions, null, 2
    actions

  ###
  ###

  _parseAction: () ->
    action = { name: @_currentString() }
    @_expectNextCode TokenCodes.COLON
    @_nextCode()
    action.options = @_parseActionOptions()
    action



  ###
  ###

  _parseActionOptions: () ->
    switch @_currentCode() 

      # action: { }
      when TokenCodes.LB then @_parseMultiOptions()

      # action: reference
      when TokenCodes.WORD then @_parseReference()

      # action: "string"
      when TokenCodes.STRING then @_parseString()
      else @_error()

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
      ops.buffer = @_parseActionOptions()
      options.push ops



    # get rid of RP
    @_nextCode()

    options




  ###
  ###

  _parseReference: () ->

    # references to watch
    refs   = []


    buffer = []

    while c = @_currentCode()

      if c is TokenCodes.WORD
        buffer.push @_parseRef()
        c = @_currentCode()

      if c is TokenCodes.LP
        buffer.push @_parseParams()
        c = @_currentCode()

      if c is TokenCodes.LB
        buffer.push @_parseBrackes()
        c = @_currentCode()


      # end of multi statement
      if ~[TokenCodes.RP, TokenCodes.RB].indexOf c
        return buffer


      if not c or ~[TokenCodes.SEMI_COLON, TokenCodes.COMA, TokenCodes.PIPE].indexOf c
        break


      buffer.push @_currentString()

      @_nextCode()

    if @_currentCode() is TokenCodes.SEMI_COLON
      @_nextCode()

    if @_currentCode() is TokenCodes.PIPE 
      buffer.push @_parsePipes()


    buffer

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
    @_expectNextCode TokenCodes.LP

    while c = @_nextCode()
      params.push @_parseActionOptions()
      c = @_currentCode()

      break if c isnt TokenCodes.COMA
      break if c is TokenCodes.RB


    @_nextCode()

    { name: name, params: params }






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
        c = @_currentCode()
      else
        refs.push name

      if c is TokenCodes.DOT 
        c = @_nextCode()

    refs

  ###
  ###

  _parseParams  : () -> @_bufferUntil TokenCodes.LP, TokenCodes.RP
  _parseBrackes : () -> @_bufferUntil TokenCodes.LB, TokenCodes.RB
    

  ###
  ###

  _bufferUntil: (left, right) ->

    c = @_currentCode() 
    buffer = []
    while c and c isnt right
      buffer.push @_t.current[1]
      if (c = @_nextCode()) is left
        buffer.push @_bufferUntil left, right


    buffer.push @_t.current[1]
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
