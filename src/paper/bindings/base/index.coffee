class BaseBinding
  constructor : (@node) ->
  load        : (@context) ->
  bind        : () ->
  unbind      : () ->

module.exports = BaseBinding