class BaseDecor
  constructor: (@node) ->
  load: (@context, callback) -> callback()
  bind: () ->
  dispose: () ->

module.exports = BaseDecor