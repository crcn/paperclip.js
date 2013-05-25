class BaseDecor
  constructor: (@node, @name) ->
  load: (@context, callback) -> callback()
  bind: () ->
  dispose: () ->

module.exports = BaseDecor