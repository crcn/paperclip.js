DecorCollection = require "./collection"

blockDecorators = 
  html      : require("./block/html")
  when      : require("./block/when")
  value     : require("./block/value")


class Factory

  ###
  ###

  getDecor: (section, clip, nodeFactory) ->

    decor = new DecorCollection clip
    for scriptName in clip.scripts.names
      if bd = blockDecorators[scriptName]
        decor.push new bd section, clip, nodeFactory, scriptName

    decor


module.exports = new Factory()