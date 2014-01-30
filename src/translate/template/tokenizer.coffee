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
  @SQUOTE  =  @QUOTE   << 1 # '
  @ETAG    =  @SQUOTE  << 1 # </tag>
  @BLOCK   =  @ETAG    << 1 
  @CHAR    =  @BLOCK   << 1
  @COMMENT =  @CHAR    << 1
  @HASH    =  @COMMENT << 1 # #
  @WS      =  @HASH    << 1 # #
  @SN      =  @WS      << 1
  @UNBOUND_VAR = @SN   << 1

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

      # comment
      if @_s.peek(4) is "<!--"
        @_s.skip(4)
        buffer = ["<!--"]
        while (cchar = @_s.cchar()) and cchar

          if cchar is "-" 
            if @_s.peek(2) is "->"
              @_s.skip(2)
              buffer.push "->"
              break


          buffer.push cchar

          @_s.nextChar()

        # skip comments
        return @_next()

      # other
      if @_s.peek(2) is "<!"
        buffer = []
        while (cchar = @_s.cchar()) and cchar
          buffer.push cchar
          if cchar is ">"
              break

          @_s.nextChar()

        # skip
        return @_t Codes.SN, buffer.join("")
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
      if @_s.peek(3) is "{{/"
        @_s.skip(2)
        return @_t Codes.EBLOCK, "{{/"

      if @_s.peek(3) is "{{#"
        @_s.skip(2)
        return @_t Codes.SBLOCK, "{{#"

      if @_s.peek(2) is "{{"
        @_s.nextChar()
        return @_t Codes.LM, "{{"

    else if cchar is "}"
      if @_s.peek(2) is "}}" and @_s.peek(3) isnt "}}}"
        @_s.nextChar()
        return @_t Codes.RM, "}}"

    else if cchar is "="
      return @_t Codes.EQ, "="

    else if cchar is "\""
      return @_t Codes.QUOTE, "\""

    else if cchar is "\'" 
      return @_t Codes.SQUOTE, "\'"

    else if cchar is "#"
      return @_t Codes.HASH, "#"


    return @_t Codes.CHAR, @_s.cchar()

module.exports = Tokenizer