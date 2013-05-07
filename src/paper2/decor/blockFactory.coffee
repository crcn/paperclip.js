DecorCollection = require "./collection"

blockDecorators = {}


decor = [
  require("./block/html"),
  require("./block/block"),
  require("./block/when"),
  require("./block/with"),
  require("./block/each"), 
  require("./block/value"),
  require("./block/template"),
  require("./block/component")
]

for BlockDecor in decor
  blockDecorators[BlockDecor.scriptName] = BlockDecor

class Factory

  ###
  ###

  getDecor: (node) ->

    decor = new DecorCollection()
    for scriptName in node.clip.scripts.names
      if bd = blockDecorators[scriptName]
        decor.push new bd node

    decor



module.exports = new Factory()