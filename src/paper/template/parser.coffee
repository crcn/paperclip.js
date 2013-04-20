Tokenizer = require "./tokenizer"
TokenCodes = Tokenizer.Codes
BaseParser = require "../../base/parser"

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

    while @_t.current
      expressions.push @_parseExpression()

    new CollectionExpression expressions

  _parseExpression: () ->
    if @_currentCode() is TokenCodes.LM
      return @_parseBlock()
    else
      return @_parseString()

  ###
  ###

  _parseBlock: () ->

    buffer = []

    # skip {{
    @_nextCode()
    while (c = @_currentCode()) isnt TokenCodes.RM and c

      # don't parse embedded templates
      if c is TokenCodes.LM
        buffer.push "{{", @_parseBlock().value, "}}"
      else
        buffer.push @_currentString()

      @_nextCode()

    # skip }}
    @_nextCode()

    new BlockExpression buffer.join("")


  _parseString: () ->
    buffer = [@_currentString()]
    @_nextCode()
    while (c = @_currentCode()) isnt TokenCodes.LM and c
      buffer.push @_currentString()
      @_nextCode()

    new StringExpression buffer.join("")




module.exports = Parser