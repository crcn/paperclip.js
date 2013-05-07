async   = require "async"
pilot   = require "pilot-block"

# loops through a collection of items
# {{#each:people}}
# {{/}}


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
    @itemName = 

    source = if @script.value?.source then @script.value.source() else (@script.value or [])

    for item in source
      @children.push @_createChild item

    async.eachSeries @children, ((child, next) ->
      child.load context, next
    ), callback

  ###
  ###

  _createChild: (item) ->
    data = {}
    data[@node.clip.get("as") or "item"] = item
    node = @node.createContent data
    node.item = item
    node

  ###
  ###

  _insert: (item) =>
    return if @_ignoreInsert
    @children.push node = @_createChild item
    node.attach @node, @context


  ###
  ###

  _remove: (item) =>
    for child, i in @children
      if child.item is item
        @children.splice(i, 1)
        child.dispose()
        break




module.exports = EachDecor