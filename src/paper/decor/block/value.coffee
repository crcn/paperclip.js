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
    @node.section.html value



module.exports = ValueDecor