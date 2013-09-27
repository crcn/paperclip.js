BaseParser    = require "../base/parser"
Tokenizer     = require "./tokenizer"
TokenCodes    = Tokenizer.Codes
bindingParser = require "../binding/parser"

RootExpression        = require "./expressions/root"
NodeExpression        = require "./expressions/node"
StringExpression      = require "./expressions/string"
BindingExpression     = require "./expressions/binding"
ChildrenExpression    = require "./expressions/children"
AttributeExpression   = require "./expressions/attribute"
AttributesExpression  = require "./expressions/attributes"
CollectionExpression  = require "./expressions/collection"
TextStringExpression  = require "./expressions/textString"
TextBindingExpression = require "./expressions/textBinding"
StringNodeExpression  = require "./expressions/stringNode"
 
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
    else if ccode is TokenCodes.SN
      return @_parseStringNode()
    else
      return @_parseText()

  ###
  ###

  _parseStringNode: () ->
    cs = @_currentString()
    @_nextCode()
    new StringNodeExpression cs

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
    ended = false
    while (ccode = @_currentCode()) and ccode
      if (TokenCodes.GT|TokenCodes.EBLOCK) & ccode
        break

      if (ccode is TokenCodes.ETAG)
        ended = true
        @_nextCode()
        break



      children.push @_parseExpression()

    unless ended
      throw new Error "tag <#{nodeName}> has no ending tag </#{nodeName}>"

    return null if not children.length

    new CollectionExpression children


  ###
  ###

  _parseAttribute: () ->

    name = @_currentString()
    if @_nextCode() is TokenCodes.EQ
      @_nextCodeSkipWs()
      value = @_parseAttributeValue()

    new AttributeExpression name, value

  ###
  ###

  _parseAttributeValue: () ->
    # skip quote
    quoteCode = @_currentCode()
    @_nextCode() # eat quote
    ret = @_parseAttrTextUntil quoteCode
    @_nextCodeSkipWs()
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


    new CollectionExpression items

  ###
  ###

  _parseAttrTextUntil: (scode) ->

    items = []

    while not ((ccode = @_currentCode()) & scode) and ccode
      if ccode is TokenCodes.LM
        items.push @_parseScript()
      else 
        str = @_parseString TokenCodes.LM | scode
        if str 
          items.push str

    new CollectionExpression items


  ###
  ###

  _parseString: (scode) ->
    buffer = []

    while not ((ccode = @_currentCode()) & scode) and ccode
      buffer.push @_currentString()
      @_nextCode()

    new StringExpression buffer.join("")

  ###
  ###

  _parseTextString: (scode) ->
    # trim
    new TextStringExpression @_parseString scode

  ###
  ###

  _parseBindingBlock: (isChild) ->

    script = @_parseScript(isChild)
    children = []

    while (ccode = @_currentCode()) isnt TokenCodes.EBLOCK and ccode
      children.push @_parseExpression()

    @_nextCode()

    # it's a child binding block
    if @_currentCode() isnt TokenCodes.RM
      @_t.putBack()
      child = @_parseBindingBlock true
    else
      @_nextCode()


    new BindingExpression script, new CollectionExpression(children), child
    
  ###
  ###

  _parseTextBinding: () -> new TextBindingExpression @_parseScript()

  ###
  ###

  _parseScript: (isChild) ->
    # skip {{ or {{#

    @_nextCode()
    buffer   = []

    while ((ccode = @_currentCode()) isnt TokenCodes.RM) and ccode
      buffer.push @_currentString()
      @_nextCode()

    if isChild
      buffer.unshift "/"

    script = bindingParser.parse buffer.join("")

    # skip }}
    @_nextCode()

    script



module.exports = new Parser()