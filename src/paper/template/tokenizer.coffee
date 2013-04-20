BaseTokenizer = require("../../base/tokenizer")

class Codes
  @OTHER  = -1
  @LM     = 1  # {{ - left mustache
  @RM     = @LM + 1  # }} - right mustache
  @CHAR   = @RM + 1  # anything other than blocks

class Tokenizer extends BaseTokenizer

  constructor: () ->
    super()
    @_s.skipWhitespace false

  @Codes: Codes
  
  _next: () ->

    # 123
    if (ccode = @_s.cchar()) is "{"
      if @_s.peek(1) is "{"
        @_s.nextChar()
        return @_t Codes.LM, "{{"

    else if (ccode = @_s.cchar()) is "}"
      if @_s.peek(1) is "}"
        @_s.nextChar()
        return @_t Codes.RM, "}}"


    return @_t Codes.CHAR, @_s.cchar()


module.exports = Tokenizer


