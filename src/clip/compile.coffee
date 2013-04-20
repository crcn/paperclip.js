Parser = require "./parser"

class Compiler

  ###
  ###

  constructor: () ->
    @_parser = new Parser()


  ###
  ###

  compile: (script) ->
    expression = @_parser.parse script
    scripts = {}

    return @_getScript(expression) if expression._type is "script"

    for script in expression.items
      scripts[script.name] = @_getScript script.options
    scripts

  ###
  ###

  _getScript: (script) -> 
    new Function "return #{script}"

compiler = new Compiler()
module.exports = (script) -> compiler.compile script
