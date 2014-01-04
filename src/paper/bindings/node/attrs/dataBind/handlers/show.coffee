class ShowAttrBinding extends require("./base")

  ###
  ###

  bind: (context) ->

    # retain default display state
    @_displayStyle = @node.style.display

    super context

  ###
  ###

  _onChange: (value) ->
    @node.style.display = if value then @_displayStyle else "none"





module.exports = ShowAttrBinding