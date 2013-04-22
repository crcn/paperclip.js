parser = require "../translate/binding/parser"

class Compiler

  ###
  ###

  constructor: () ->
    @_parser = parser

  ###
  ###

  compile: (source) ->
    expression = @_parser.parse source
    scripts = {}
    fn = new Function(" return " + String(expression))
    fn.call()



compiler = new Compiler()
module.exports = (script) -> compiler.compile script
