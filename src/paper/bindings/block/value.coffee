ent = require "ent"

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

    @section.replaceChildNodes @nodeFactory.createTextNode ent.encode value




module.exports = ValueDecor