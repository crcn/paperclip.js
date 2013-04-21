class Handler extends require("./base")
  init: () ->
    $(@element).bind "keyup", @_onKeyUp

  _onKeyUp: (event) =>
    return if event.keyCode isnt 13
    @watcher.update()

module.exports = Handler