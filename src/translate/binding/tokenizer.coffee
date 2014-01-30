BaseTokenizer = require "../base/tokenizer"

class Codes

  @OTHER  = -1           # ?
  @WORD   = 256         # something
  @STRING = @WORD   + 1 # "something"
  @VAR    = @STRING + 1 # variable
  @U_VAR  = @VAR    + 1 
  @WS     = @U_VAR  + 1 # \s
  @NUMBER = @WS     + 1 # 0-9
  @BOOL   = @NUMBER + 1 # true / false
  @UNDEF  = @BOOL   + 1 # true / false
  @AS     = @UNDEF  + 1 # casting
  @OR     = @AS     + 1 # ||
  @ASSIGN = @OR     + 1 # =
  @EQ     = @ASSIGN + 1 # ==
  @NEQ    = @EQ     + 1 # !=
  @NOT    = @NEQ    + 1 # !

  @DOLLAR     = 36       # $
  @LP         = 40       # (
  @RP         = 41       # )
  @COMA       = 44       # ,
  @DOT        = 46       # .
  @BS         = 47       # /
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
      return @_t(Codes.UNDEF, word) if /undefined|null/.test word
      return @_t(Codes.AS, word) if word is "as"
      return @_t Codes.VAR, word

    # unbound var `
    else if ccode is 96
      return @_t Codes.U_VAR, "`"

    # string?
    else if (t = @_tstring(Codes.STRING))
      return t

    else if @_s.is09()
      return @_t Codes.NUMBER, @_s.nextNumber()


    else if ccode is 33
      if @_s.peek(2) is "!="
        @_s.skip(1)
        return @_t Codes.NEQ, "!="
      else
        return @_t Codes.NOT, "!"
    
    else if ccode is 61
      if @_s.peek(2) is "=="
        @_s.skip(1)
        return @_t Codes.EQ, "=="
      else
        return @_t Codes.ASSIGN, "="


    else if ccode is 124 and @_s.peek(2) is "||"
      @_s.nextChar()
      return @_t Codes.OR, "||"

    else if Codes.byCodes[ccode]
      @_t Codes.byCodes[ccode], @_s.cchar()



module.exports = Tokenizer