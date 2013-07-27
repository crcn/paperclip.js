escapeHTML = require "../../utils/escapeHTML"

class ValueDecor extends require("./base")
  
  ###
  ###

  load: (@context) ->
    v = @clip.get("value")
    if v?
      @_onChange v

  ###
  ###

  _onChange: (value) ->
  
    unless value?
      value = ""

    @section.replaceChildNodes @nodeFactory.createTextNode escapeHTML value




module.exports = ValueDecor