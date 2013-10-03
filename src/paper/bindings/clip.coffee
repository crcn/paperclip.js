
class ClipBinding extends require("./base")

  ###
  ###

  constructor: (@clip) ->

  ###
  ###

  bind: (@context) ->
    @clip.reset @context
    @clip.watch()

  ###
  ###

  unbind: () ->
    @clip.unwatch()

module.exports = ClipBinding