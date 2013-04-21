
class Handler extends require("./base")
  init: () ->
    $(@element).bind "click", @_onClicked

  _onClicked: (event) =>
    @watcher.update()

module.exports = Handler