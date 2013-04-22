Parser = require "../translate/binding/parser"

class Compiler

  ###
  ###

  constructor: () ->
    @_parser = new Parser()

  ###
  ###

  compile: (source) ->
    expression = @_parser.parse source
    scripts = {}

    return @_getScript(expression) if expression._type isnt "actions"

    for script in expression.items
      scripts[script.name] = @_getScript script.options
    scripts

  ###
  ###

  _getScript: (expression, source) -> 
    fn = new Function "return #{expression}"
    fn.expression = expression
    fn.source = source
    fn


compiler = new Compiler()
module.exports = (script) -> compiler.compile script
