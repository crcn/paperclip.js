escapeHTML = require "../../utils/escapeHTML"

class ValueDecor extends require("./base")

  ###
  ###

  _onChange: (value) ->
  
    unless value?
      value = ""

    if typeof window isnt "undefined"

      # minor optimization - don't create text node if not necessary
      cn = @section.getChildNodes()

      if cn.length
        cn[0].nodeValue = value
        return

    @section.replaceChildNodes @application.nodeFactory.createTextNode String(value), true


module.exports = ValueDecor