async   = require "async"
pilot   = require "pilot-block"

# loops through a collection of items
# {{#each:people}}
# {{/}}


class EachNode extends require("../../nodes/bindable")
  
  ###
  ###

  constructor: (@item, @block, @itemName = "item") ->
    super()
    @content = @block.contentFactory()

  ###
  ###

  bind: () ->
    super()
    @content.bind()

  ###
  ###

  load: (context, callback) ->
    data = {}
    data[@itemName] = @item
    super context.child(data), callback

  ###
  ###

  _loadChildren: (context, callback) ->
    @content.load context, callback



class EachDecor extends require("./base")

  ###
  ###

  @scriptName: "each"

  ###
  ###

  constructor: () ->
    super arguments...

  ###
  ###

  bind: () ->
    super()

    for child in @children
      child.bind()

    if @script.value?.source
      @_ignoreInsert = true
      @script.value.bind {
        insert: @_insert,
        remove: @_remove
      }
      @_ignoreInsert = false

  ###
  ###

  load: (@context, callback) -> 
    @children = []
    @itemName = @node.clip.get("as") or "item"

    source = if @script.value?.source then @script.value.source() else (@script.value or [])

    for item in source
      @children.push new EachNode item, @node, @itemName

    async.eachSeries @children, ((child, next) ->
      child.load context, next
    ), callback

  ###
  ###

  _insert: (item) =>
    return if @_ignoreInsert
    @children.push node = new EachNode item, @node, @itemName
    node.load context = @context.child().detachBuffer(), (err) =>
      return if err?
      @node.section.append pilot.createSection context.buffer.join("")
      pilot.update @node.section.parent
      node.bind()




  ###
  ###

  _remove: (item) =>
    for child, i in @children
      if child.item is item
        @children.splice(i, 1)
        child.section.dispose()
        break




module.exports = EachDecor