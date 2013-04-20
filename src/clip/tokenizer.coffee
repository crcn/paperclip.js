BaseTokenizer = require("../base/tokenizer")

class Codes

  @OTHER  = -1           # ?
  @WORD   = 256         # something
  @STRING = @WORD   + 1 # "something"
  @VAR    = @STRING + 1 # variable
  @WS     = @VAR    + 1 # \s
  @NUMBER = @WS     + 1 # 0-9
  @BOOL   = @NUMBER + 1 # 0-9

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

  @byCodes = {}

  @key = (code) ->
    for key of Codes
      return key if Codes[key] is code


for key of Codes
  Codes.byCodes[Codes[key]] = Codes[key]



###

1. check if word. If word, then eval until /}|,/
value = parse("name")

###

class Tokenizer extends BaseTokenizer
  
  ###
  ###

  codes: Codes
  @codes = Codes

  ###
  ###

  _next: () ->
    # word?
    if @_s.isAZ() or (ccode = @_s.ccode()) is 36 or ccode is 95 or ccode is 64
      word = @_s.next /[_$@a-zA-Z0-9]+/

      return @_t(Codes.BOOL, word) if /true|false/.test word
      return @_t Codes.VAR, word

    # string?
    else if ccode is 39 or ccode is 34

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

      @_s.skipWhitespace true
      return @_t Codes.STRING, buffer.join("")

    else if @_s.is09()
      return @_t Codes.NUMBER, @_s.nextNumber()

    else if @_s.isWs()
      return @_t Codes.WS, @_s.next /[\s\r\n\t]+/

    else if Codes.byCodes[ccode]
      @_t Codes.byCodes[ccode], @_s.cchar()



module.exports = Tokenizer