
BaseTokenizer = require "../base/tokenizer"

class Codes
  @OTHER  = -1
  @LM     = 1  # {{ - left mustache
  @RM     = @LM + 1  # }} - right mustache
  @CHAR   = @RM + 1  # anything other than blocks

class Tokenizer extends BaseTokenizer
  
  ###
  ###

  @Codes: Codes

  ###
  ###

  constructor: () ->
    super()
    @_s.skipWhitespace false

  
  ###
  ###

  _next: () ->

    if (ccode = @_s.cchar()) is "{"
      if @_s.peek(2) is "{{"
        @_s.nextChar()
        return @_t Codes.LM, "{{"

    else if (ccode = @_s.cchar()) is "}"
      if @_s.peek(2) is "}}"
        @_s.nextChar()
        return @_t Codes.RM, "}}"


    return @_t Codes.CHAR, @_s.cchar()


module.exports = Tokenizer


