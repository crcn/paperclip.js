strscan = require "strscanner"

class Codes
  @OTHER  = -1           # ?
  @WORD   = 1            # something
  @STRING = @WORD   << 1 # "something"
  @WS     = @STRING << 1 # \s

  @DOLLAR     = 36       # $
  @LP         = 40       # (
  @RP         = 41       # )
  @COMA       = 44       # ,
  @DOT        = 46       # .
  @COLON      = 58       # :
  @SEMI_COLON = 59       # ;
  @AT         = 64       # @
  @LB         = 123      # {
  @PIPE       = 124      # |
  @RB         = 125      # }


for key of Codes
  Codes[Codes[key]] = Codes[key]



###

1. check if word. If word, then eval until /}|,/
value = parse("name")

###

class Tokenizer
  
  ###
  ###

  codes: Codes

  ###
  ###

  constructor: () ->
    @_s = strscan "", { skipWhitespace: false }


  ###
  ###

  source: (value) -> 
    return @_source if not arguments.length
    @_s.source @_source = value
    @

  ###
  ###

  nextToken: () ->

    return null if @_s.eof()

    # word?
    if @_s.isAZ()
      return @_t Codes.WORD, @_s.nextWord()

    # string?
    else if (ccode = @_s.ccode()) is 39 or ccode is 34

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

      return @_t Codes.STRING, buffer.join("")

    else if @_s.isWs()
      return @_t Codes.WS, @_s.next /[\s\r\n\t]+/

    # console.log ccode, @_s.cchar()

    return @_t Codes[ccode] or Codes.OTHER, @_s.cchar()



  ###
  ###

  _t: (code, value) ->

    # trigger the next char
    @_s.nextChar()
    [code, value]







module.exports = new Tokenizer()