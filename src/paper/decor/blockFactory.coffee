DecorCollection = require "./collection"

blockDecorators = 
  html      : require("./block/html")
  when      : require("./block/when")
  value     : require("./block/value")


class Factory

  ###
  ###

  getDecor: (node) ->

    decor = new DecorCollection()
    for scriptName in node.clip.scripts.names
      if bd = blockDecorators[scriptName]
        decor.push new bd node, scriptName

    decor


module.exports = new Factory()