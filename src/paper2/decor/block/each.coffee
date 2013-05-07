async   = require "async"

# loops through a collection of items
# {{#each:people}}
# {{/}}


class EachNode extends require("../../nodes/bindable")
  
  ###
  ###

  constructor: (@item, @block, @itemName = "item") ->
    super()

  ###
  ###

  load: (context, callback) ->
    data = {}
    data[@itemName] = @item
    super context.child(data), callback


  ###
  ###

  _loadChildren: (info, callback) ->
    @block.content.load info, callback









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

  load: (context, callback) -> 
    @children = []
    itemName = @node.clip.get("as") or "item"

    for item in @script.value or []
      @children.push new EachNode item, @node, itemName

    async.eachSeries @children, ((child, next) ->
      child.load context, next
    ), callback



module.exports = EachDecor