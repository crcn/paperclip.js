Parser = require "./parser"
Clip   = require "../../clip"
parser = new Parser()

expr = parser.parse("hello, how are you {{person.name}}, how old is your {{person.sibling}}?")

class TemplateBinding

  ###
  ###

  constructor: (@templateWatcher, @fn) ->
    @clip = new Clip { script: @fn, data: @templateWatcher.data }
    @clip.bind("value").watch(true).to(@update)
    @value = @clip.get("value")

  ###
  ###

  dispose: () ->
    @clip.dispose()


  ###
  ###

  update: (value) =>
    @value = value
    @templateWatcher.update()

  ###
  ###

  toString: () -> @value


class TemplateWatcher

  ###
  ###

  constructor: (@data, @fn) ->
    @buffer = []
    @_bindings = []
    @fn.call @
    @update()

  ###
  ###

  dispose: () ->
    for binding in @_bindings
      binding.dispose()

    @_bindings = []

  ###
  ###

  push: (source) ->   
    @buffer.push source
    @

  ###
  ###

  bind: (script) ->
    @buffer.push new TemplateBinding @, script
    @

  ###
  ###

  update: () ->
    @text = @render()

  ###
  ###

  render: () -> @buffer.join ""

  ###
  ###

  toString: () -> @text






class Template

  ###
  ###


  constructor: (source) -> 
    @fn = new Function "return " + parser.parse source 


  ###
  ###

  render: (data) ->
    new TemplateWatcher(data, @fn)


module.exports = Template


