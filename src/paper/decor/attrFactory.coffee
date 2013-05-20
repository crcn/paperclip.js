Collection = require "./collection"
ClippedBuffer = require("../../clip/buffer")
Clip = require("../../clip")

attrDecorators = 
  css     : require("./attr/css")
  show    : require("./attr/show")
  style   : require("./attr/style")
  value   : require("./attr/value")
  click   : require("./attr/click")
  enter   : require("./attr/enter")
  disable : require("./attr/disable")
  checked : require("./attr/checked")



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


    