BaseTokenizer = require "../base/tokenizer"

###
 <div id="test">

 </div>
###

class Codes
  @OTHER   = -1
  @WORD    =  2
  @LT      =  @WORD    << 1 # <
  @GT      =  @LT      << 1 # >
  @ETNC    =  @GT      << 1 # />
  @BS      =  @ETNC    << 1 # /
  @EQ      =  @BS      << 1 # ''
  @STRING  =  @EQ      << 1 # 
  @LM      =  @STRING  << 1 # {{
  @RM      =  @LM      << 1 # }}
  @SBLOCK  =  @RM      << 1 # }}
  @EBLOCK  =  @SBLOCK  << 1 # {{/}}
  @QUOTE   =  @EBLOCK  << 1 # "
  @ETAG    =  @QUOTE   << 1 # </tag>
  @BLOCK   =  @ETAG    << 1 
  @CHAR    =  @BLOCK   << 1
  @COMMENT =  @CHAR    << 1
  @HASH    =  @COMMENT << 1 # #
  @WS      =  @HASH    << 1 # #



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
      return @_t Codes.WORD, @_s.next /[$_\-a-zA-Z0-9]+/

    if (cchar = @_s.cchar()) is "<"

      if @_s.peek(4) is "<!--"
        @_s.skip(4)
        while (cchar = @_s.cchar()) and cchar
          if cchar is "-"
            if @_s.peek(3) is "-->"
              @_s.skip(3)
              break

          @_s.nextChar()

        # skip
        return @_next()
      else  

        if @_s.peek(2) is "</"
          word = @_s.next /[a-zA-Z0-9]+/
          @_s.skip(1)
          return @_t Codes.ETAG, word

        return @_t Codes.LT, "<"

    else if cchar is "/"
      if @_s.peek(2) is "/>"
        @_s.skip(1)
        return @_t Codes.ETNC, "/>"

      return @_t Codes.BS, "/"

    else if cchar is ">"
      return @_t Codes.GT, ">"


    else if @_s.isWs()
      @_s.next /[\s\r\n\t]+/
      return @_t Codes.WS, " "

    else if cchar is "{"
      if @_s.peek(5) is "{{/}}"
        @_s.skip(5)
        return @_t Codes.EBLOCK, "{{/}}"

      if @_s.peek(3) is "{{#"
        @_s.skip(2)
        return @_t Codes.SBLOCK, "{{#"

      if @_s.peek(2) is "{{"
        @_s.nextChar()
        return @_t Codes.LM, "{{"

    else if cchar is "}"
      if @_s.peek(2) is "}}"
        @_s.nextChar()
        return @_t Codes.RM, "}}"

    else if cchar is "="
      return @_t Codes.EQ, "="

    else if cchar is "\""
      return @_t Codes.QUOTE, "\""

    else if cchar is "#"
      return @_t Codes.HASH, "#"


    return @_t Codes.CHAR, @_s.cchar()

module.exports = Tokenizer