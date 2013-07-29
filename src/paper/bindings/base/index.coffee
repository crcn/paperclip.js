class BaseBinding
  constructor : (@node) ->
  bind        : (@context) ->
  unbind      : () ->

module.exports = BaseBinding