
class Parser

  ###
  ###

  constructor: (@_t) ->

  ###
  ###

  parse: (source) ->
    @_source = source
    @_t.source source
    @_parse()

  ###
  ###

  _parse: () ->
    # OVERRIDE ME

  ###
  ###

  _expectNextCode: (code) ->
    @_error() if @_nextCode() isnt code

  ###
  ###

  _expectCurrentCode: (code) ->
    @_error() if @_currentCode() isnt code

  ###
  ###

  _nextCode: () -> @_t.next()?[0]

  ###
  ###

  _nextCodeSkipWs: () ->

    while /[\r\n\s\t]+/.test @_nextString()
      true

    @_currentCode()

  ###
  ###


  skipWhitespace: () ->
    @_t.skipWhitespace arguments...


  ###
  ###

  _nextString: () -> @_t.next()?[1]

  ###
  ###

  _currentCode: () -> @_t.current?[0]

  ###
  ###

  _currentString: () -> @_t.current?[1]


  _error: () ->

    unless @_t.current
      throw new Error "\n\nUnexpected End Of File\n\n"

    buffer = "\n\nUnexpected Token: #{@_t.current[1]}\n\n"
    buffer += @_bufferPosInfo()

    throw new Error buffer

  _bufferPosInfo: () ->
    buffer = @_source + "\n"

    epos = @_t.current[2]
    spos = epos - @_t.current[1].length - 1

    for n in [0..@_source.length]
      if n > spos and n < epos
        char = "^"
      else
        char = "-"

      buffer += char

    buffer += "\n\n"
    buffer


module.exports = Parser
