async   = require "async"
pilot   = require "pilot-block"

# loops through a collection of items
# {{#each:people}}
# {{/}}


class EachDecor extends require("./base")


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

    for model in source
      @children.push @_createChild model

    async.eachSeries @children, ((child, next) ->
      child.load context, next
    ), callback

  ###
  ###

  _createChild: (model) ->
    data = {}
    data[@node.clip.get("as") or "model"] = model
    node = @node.createContent data
    node.model = model
    node

  ###
  ###

  _insert: (model) =>
    return if @_ignoreInsert
    @children.push node = @_createChild model
    node.attach @node, @context


  ###
  ###

  _remove: (model) =>
    for child, i in @children
      if child.model is model
        @children.splice(i, 1)
        child.dispose()
        break




module.exports = EachDecor