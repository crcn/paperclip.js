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
    for script in expression.items
      fn = eval "(function(){return #{script.options}})"
      scripts[script.name] = fn
    scripts

compiler = new Compiler()
module.exports = (script) -> compiler.compile script
