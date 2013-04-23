BaseParser    = require "../base/parser"
Tokenizer     = require "./tokenizer"
TokenCodes    = Tokenizer.Codes
bindingParser = require "../binding/parser"

NodeExpression        = require "./expressions/node"
TextExpression        = require "./expressions/text"
StringExpression      = require "./expressions/string"
BindingExpression     = require "./expressions/binding"
ChildrenExpression    = require "./expressions/children"
AttributeExpression   = require "./expressions/attribute"
AttributesExpression  = require "./expressions/attributes"
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
    while @_t.current and i++ < 20
      expressions.push @_parseExpression()

    new ChildrenExpression expressions

  ###
  ###

  _parseExpression: () ->
    if (cchar  = @_currentCode()) is TokenCodes.LT
      return @_parseNode()
    else
      return @_parseText()

  ###
  ###

  _parseNode: () ->

    name       = @_nextString()
    @_nextCode()
    attributes = @_parseAttributes()
    children = []

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

    attrs

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

      if ccode is TokenCodes.WS 
        @_nextCode()
        continue


      children.push @_parseExpression()

    children




  ###
  ###

  _parseAttribute: () ->

    name = @_currentString()
    if @_nextCode() is TokenCodes.EQ
      @_nextCode()
      value = @_parseAttributeValue()

    new AttributeExpression name, value

  ###
  ###

  _parseAttributeValue: () ->
    # skip quote
    @_nextCode()
    ret = @_parseTextUntil TokenCodes.QUOTE
    @_nextCode()
    ret


  ###
  ###

  _parseText: () ->
    @_parseTextUntil TokenCodes.EBLOCK | TokenCodes.LT | TokenCodes.ETAG


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


    new TextExpression items

  ###
  ###

  _parseTextString: (scode) ->
    buffer = []

    while not ((ccode = @_currentCode()) & scode) and ccode
      buffer.push @_currentString()
      @_nextCode()

    # just a blank string? skip it.
    return null if buffer.join("").match(/^\s$/) 

    # trim
    new TextStringExpression new StringExpression buffer.join("").replace(/^\s+/, "").replace(/\s$/, "")

  ###
  ###

  _parseTextBinding: () ->

    # skip {{
    @_nextCode()


    # {{#each:children}} dun dun dun {{/}}
    if @_currentCode() is TokenCodes.HASH
      hasChildren = true
      @_nextCode()

    buffer   = []
    children = []

    while ((ccode = @_currentCode()) isnt TokenCodes.RM) and ccode
      buffer.push @_currentString()
      @_nextCode()

    script = bindingParser.parse buffer.join("")

    # skip }}
    @_nextCode()

    if hasChildren
      while (ccode = @_currentCode()) isnt TokenCodes.EBLOCK and ccode
        children.push @_parseExpression()

      @_nextCode()


    return new BindingExpression script, children



module.exports = Parser