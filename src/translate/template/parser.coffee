BaseParser    = require "../base/parser"
Tokenizer     = require "./tokenizer"
TokenCodes    = Tokenizer.Codes
bindingParser = require "../binding/parser"

RootExpression        = require "./expressions/root"
NodeExpression        = require "./expressions/node"
TextExpression        = require "./expressions/text"
StringExpression      = require "./expressions/string"
BindingExpression     = require "./expressions/binding"
ChildrenExpression    = require "./expressions/children"
AttributeExpression   = require "./expressions/attribute"
AttributesExpression  = require "./expressions/attributes"
CollectionExpression  = require "./expressions/collection"
TextStringExpression  = require "./expressions/textString"
TextBindingExpression = require "./expressions/textBinding"

class Parser extends BaseParser

  ###
  ###

  constructor: () ->
    super()
    @_t  = new Tokenizer()


  ###
  ###

  _parse: () ->
    expressions = []
    i = 0
    @_nextCode()
    while @_t.current
      expr = @_parseExpression()
      if expr  
        expressions.push expr

    new RootExpression new CollectionExpression expressions

  ###
  ###

  _parseExpression: () ->
    return null if not (ccode = @_currentCode())
    if ccode is TokenCodes.LT
      return @_parseNode()
    else if ccode is TokenCodes.SBLOCK
      return @_parseBindingBlock()
    else
      return @_parseText()

  ###
  ###

  _parseNode: () ->

    name       = @_nextString()
    @_nextCode()
    attributes = @_parseAttributes()

    while (cchar = @_currentCode()) and cchar
      if cchar is TokenCodes.GT
        @_nextCode()
        children = @_parseChildren(name)
        break
      else if cchar is TokenCodes.ETNC 
        @_nextCode()
        break
      else
        @_nextCode()

    new NodeExpression name, attributes, children

  ###
  ###

  _parseAttributes: () ->
    attrs = []
    while ccode = @_currentCode()
      if (TokenCodes.GT|TokenCodes.ETNC) & ccode
        break
      if ccode is TokenCodes.WS
        @_nextCode()
        continue
      attrs.push @_parseAttribute()

    return null if not attrs.length
    
    new AttributesExpression attrs

  ###
  ###

  _parseChildren: (nodeName) ->
    children = []
    while (ccode = @_currentCode()) and ccode
      if (TokenCodes.GT|TokenCodes.EBLOCK) & ccode
        break

      if (ccode is TokenCodes.ETAG)
        @_nextCode()
        break

      #if ccode is TokenCodes.WS 
      #  @_nextCode()
      #  continue


      children.push @_parseExpression()

    return null if not children.length

    new CollectionExpression children


  ###
  ###

  _parseAttribute: () ->

    name = @_currentString()
    if @_nextCode() is TokenCodes.EQ
      @_nextCode()
      value = @_parseAttributeValue().buffer

    new AttributeExpression name, value

  ###
  ###

  _parseAttributeValue: () ->
    # skip quote
    @_nextCode()
    ret = @_parseTextUntil(TokenCodes.QUOTE)
    @_nextCode()
    ret


  ###
  ###

  _parseText: () ->
    @_parseTextUntil TokenCodes.EBLOCK | TokenCodes.SBLOCK | TokenCodes.LT | TokenCodes.ETAG


  ###
  ###

  _parseTextUntil: (scode) ->

    items   = []

    while not ((ccode = @_currentCode()) & scode) and ccode
      if ccode is TokenCodes.LM
        items.push @_parseTextBinding()
      else 
        str = @_parseTextString TokenCodes.LM | scode
        if str 
          items.push str


    new TextExpression new CollectionExpression items

  ###
  ###

  _parseTextString: (scode) ->
    buffer = []

    while not ((ccode = @_currentCode()) & scode) and ccode
      buffer.push @_currentString()
      @_nextCode()

    # just a blank string? skip it.
    # return null if buffer.join("").match(/^\s$/) 

    # trim
    new TextStringExpression new StringExpression buffer.join("")

  ###
  ###

  _parseBindingBlock: () ->

    script = @_parseScript()
    children = []

    while (ccode = @_currentCode()) isnt TokenCodes.EBLOCK and ccode
      children.push @_parseExpression()


    # each {{/}}
    @_nextCode()

    new BindingExpression script, new CollectionExpression children
    
  ###
  ###

  _parseTextBinding: () -> new TextBindingExpression @_parseScript()

  ###
  ###

  _parseScript: () ->
    # skip {{ or {{#

    @_nextCode()
    buffer   = []

    while ((ccode = @_currentCode()) isnt TokenCodes.RM) and ccode
      buffer.push @_currentString()
      @_nextCode()

    script = bindingParser.parse buffer.join("")

    # skip }}
    @_nextCode()

    script



module.exports = new Parser()