Collection = require "./collection"
ClippedBuffer = require("../../clip/buffer")
Clip = require("../../clip")

attrDecorators = {}

decor = [
  require("./attr/value"),
  require("./attr/click"),
  require("./attr/enter")
]


for AttrDecor in decor
  attrDecorators[AttrDecor.scriptName] = AttrDecor

DataBindDecor = require("./attr/dataBind")
TextAttrBinding = require("./attr/text")

class Factory

  ###
  ###

  getDecor: (node) ->
    decor = new Collection()

    if node.attributes["data-bind"]
      decor.clip = clip = new Clip { script: node.attributes["data-bind"][0], watch: false }
      for name in clip.scripts.names
        if ad = attrDecorators[name]
          decor.push new ad node, name, clip
        else
          decor.push new DataBindDecor node, name, clip


    for attribute of node.attributes
      decor.push new TextAttrBinding node, attribute, new ClippedBuffer node.attributes[attribute]

    decor




module.exports = new Factory


    