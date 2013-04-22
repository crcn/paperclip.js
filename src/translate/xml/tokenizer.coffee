BaseTokenizer = require "../base/tokenizer"

###
 <div id="test">

 </div>
###

class Codes

  @OTHER   = -1
  @WORD    =  0 
  @STAG    =  @WORD   + 1 # <
  @ETAG    =  @STAG   + 1 # </ or />
  @EQ      =  @ETAG   + 1 # ''
  @STRING  =  @EQ     + 1 # 
  @LM      =  @STRING + 1 # {{
  @RM      =  @LM     + 1 # }}
  @BLOCK   =  @RM     + 1 
  @CHAR    =  @BLOCK  + 1
  @COMMENT =  @CHAR   + 1



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

    if @_s.isAZ()
      return @_t Codes.WORD, @_s.next /[a-zA-Z0-9]+/

    if (cchar = @_s.cchar()) is "<"

      if @_s.peek(4) is "<!--"
        @_s.skip(4)
        buffer = []
        while (cchar = @_s.cchar()) and cchar
          if cchar is "-"
            if @_s.peek(3) is "-->"
              @_s.skip(3)
              break

          console.log cchar
          buffer.push cchar
          @_s.nextChar()

        return @_t Codes.COMMENT, buffer.join ""
      else if @_s.peek(2) is "</"
        @_s.skip(1)
        return @_t Codes.ETAG, "</"

    else if cchar is "/"
      if @_s.peek(2) is "/>"
        @_s.skip(1)
        return @_t Codes.ETAG, "/>"

    else if cchar is ">"
      return @_t Codes.ETAG, ">"

    else if (t = @_tstring(Codes.STRING))
      return t

    else if cchar is "{"
      if @_s.peek(2) is "{{"
        @_s.nextChar()
        return @_t Codes.LM, "{{"

    else if cchar is "}"
      if @_s.peek(2) is "}}"
        @_s.nextChar()
        return @_t Codes.RM, "}}"


    return @_t Codes.CHAR, @_s.cchar()

module.exports = Tokenizer