class BaseDecor
  constructor: (@node, @name) ->
  load: (@context) ->
  bind: () ->
  dispose: () ->
  unbind: () -> @dispose()

module.exports = BaseDecor