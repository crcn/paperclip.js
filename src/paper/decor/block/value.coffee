class ValueDecor extends require("./base")
  
  ###
  ###

  load: (context, callback) ->
    v = @clip.get("value")
    if v?
      context.buffer.push v
    callback()

  ###
  ###

  _onChange: (value) ->
    @node.section.html value



module.exports = ValueDecor