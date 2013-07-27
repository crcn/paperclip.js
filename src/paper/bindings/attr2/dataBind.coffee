class DataBindDecor extends require("./base")

  constructor: (node, @name, @clip) ->
    @attrName = "data-bind"
    @script = clip.script(@name)
    @refs = @script.script.refs
    super node, @name

  load: (context) ->
    if @watch isnt false
      @script.update()
    super context

  bind: () ->
    @clip.bind(@name).to @_onChange
    @element = @node.section.elements[0]

    if @watch isnt false
      @script.watch()

  _onChange: (value) =>


module.exports = DataBindDecor

