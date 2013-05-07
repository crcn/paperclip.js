class BaseDecor
  constructor: (@node) ->
  load: (@context, callback) -> callback()
  bind: () ->

module.exports = BaseDecor