class BaseDecor
  constructor: (@node, @name) ->
  load: (@context) ->
  bind: () ->
<<<<<<< HEAD:src/paper/bindings/attr2/base.coffee
  unbind: () ->
=======
  dispose: () ->
  unbind: () -> @dispose()
>>>>>>> master:src/paper/decor/attr/base.coffee

module.exports = BaseDecor