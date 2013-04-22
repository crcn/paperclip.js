Tokenizer  = require "./tokenizer"
TokenCodes = Tokenizer.Codes
BaseParser = require "../base/parser"

BlockExpression      = require "./expressions/block"
StringExpression     = require "./expressions/string"
CollectionExpression = require "./expressions/collection"

class Parser extends BaseParser

  ###
  ###

  constructor: () ->
    @_t = new Tokenizer()

  ###
  ###

  _parse: () ->
    expressions = []
    @_nextCode()

    # find ALL the expressions until we're at the end
    while @_t.current
      expressions.push @_parseExpression()

    new CollectionExpression expressions

  ###
  ###


  _parseExpression: () ->

    # is it a {{ ? start of a template part
    if @_currentCode() is TokenCodes.LM
      return @_parseBlock()
    else
      return @_parseString()

  ###
   parses a template block
  ###

  _parseBlock: () ->

    buffer = []

    # skip {{
    @_nextCode()
    while (c = @_currentCode()) isnt TokenCodes.RM and c

      # don't parse embedded templates, just skip them
      if c is TokenCodes.LM 
        buffer.push "{{", @_parseBlock().value, "}}"
      else
        buffer.push @_currentString()

      @_nextCode()

    # skip }}
    @_nextCode()

    new BlockExpression buffer.join("")

  ###
   parses anything other than {{ }} blocks
  ###

  _parseString: () ->
    buffer = [@_currentString()]
    @_nextCode()
    while (c = @_currentCode()) isnt TokenCodes.LM and c
      buffer.push @_currentString()
      @_nextCode()

    new StringExpression buffer.join("")




module.exports = Parser