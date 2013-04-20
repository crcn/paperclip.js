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