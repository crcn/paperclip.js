escapeHTML = require "../../utils/escapeHTML"

class ValueDecor extends require("./base")
  
  ###
  ###

  load: (@stream) ->
    v = @clip.get("value")
    if v?
      context.buffer.push v
      @node.target.html v

  ###
  ###

  _onChange: (value) ->
    unless value?
      value = ""

    @node.section.html escapeHTML value



module.exports = ValueDecor