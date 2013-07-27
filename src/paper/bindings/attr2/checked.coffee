class CheckedDecor extends require("./dataBind")
  
  ###
  ###

  bind: () ->
    super()
    @clip.bind("checked").to(@_show).now()

  ###
  ###
  
  _show: (value) => 
    @element.checked = value


module.exports = CheckedDecor