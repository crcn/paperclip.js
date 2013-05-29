class BaseDecor
  constructor: (@node, @name) ->
  load: (@context) ->
  bind: () ->
  dispose: () ->

module.exports = BaseDecor