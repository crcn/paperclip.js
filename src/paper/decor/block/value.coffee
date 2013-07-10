escapeHTML = require "../../utils/escapeHTML"

class ValueDecor extends require("./base")
  
  ###
  ###

  load: (context) ->
    v = @clip.get("value")
    if v?
      @node.target.html v

  ###
  ###

  _onChange: (value) ->
    unless value?
      value = ""
    @node.section.html escapeHTML value



module.exports = ValueDecor