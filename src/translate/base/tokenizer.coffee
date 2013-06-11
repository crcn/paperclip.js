strscan = require "strscanner"

###

1. check if word. If word, then eval until /}|,/
value = parse("name")

###

class Tokenizer
  
  ###
  ###

  constructor: () ->
    @_s = strscan "", { skipWhitespace: true }
    @_pool = []

  ###
  ###

  peekNext: () ->
    c = @current
    next = @next()
    @putBack()
    @current = c
    next

  ###
  ###

  source: (value) -> 
    return @_source if not arguments.length
    @_s.source @_source = value
    @


  skipWhitespace: (value) ->
    return @_s.skipWhitespace() unless arguments.length
    @_s.skipWhitespace value

  ###
  ###

  putBack: () ->
    if @current
      @_pool.push @current

  ###
  ###

  next: () ->
    return (@current = @_pool.pop()) if @_pool.length
    return (@current = null) if @_s.eof()

    # next, or other
    @_next() or @_t(-1, @_s.cchar())

  ###
  ###

  _tstring: (code) ->
    ccode = @_s.ccode()
    if ccode is 39 or ccode is 34

      skip = @_s.skipWhitespace()
      @_s.skipWhitespace false

      buffer = []
      while ((c = @_s.nextChar()) and not @_s.eof())


        cscode = @_s.ccode()

        # skip the next char if escaped (\)
        if cscode is 92 
          buffer.push @_s.nextChar()
          continue

        if cscode is ccode
          break

        buffer.push c

      @_s.skipWhitespace skip
      return @_t code, buffer.join("")

    return false

  ###
  ###
  
  _next: () ->
    # OVERRIDE ME!

  ###
  ###

  _t: (code, value) ->

    # trigger the next char
    p = @_s.pos()
    @_s.nextChar()
    @current = [code, value, p]


module.exports = Tokenizer