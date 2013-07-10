escapeHTML = require "../../utils/escapeHTML"

class ValueDecor extends require("./base")
  
  ###
  ###

  load: (@stream) ->
    v = @clip.get("value")
    if v?
      @_onChange v

  ###
  ###

  _onChange: (value) ->
    unless value?
      value = ""

    @node.target.replace @stream.createTextNode escapeHTML value
    # @node.section.html escapeHTML value



module.exports = ValueDecor