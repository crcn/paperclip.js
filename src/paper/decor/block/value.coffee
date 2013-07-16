escapeHTML = require "../../utils/escapeHTML"

class ValueDecor extends require("./base")
  
  ###
  ###

  load: (context) ->
    v = @clip.get("value")
    if v?
      context.buffer.push v

  ###
  ###

  _onChange: (value) ->
    unless value?
      value = ""
    @node.section?.html escapeHTML value



module.exports = ValueDecor