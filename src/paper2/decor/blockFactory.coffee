DecorCollection = require "./collection"

blockDecorators = 
  html: require("./block/html")
  block: require("./block/block")
  when: require("./block/when")
  with: require("./block/with")
  each: require("./block/each")
  value: require("./block/value")
  template: require("./block/template")
  component: require("./block/template")



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