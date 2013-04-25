pcid = 0

class Bindable extends require("./base")
  
  ###
  ###

  _bindingStart: (info) ->
    info.buffer.push "<!--sbnd:#{@_pcid = ++pcid}-->"

  ###
  ###

  _bindingEnd: (info, callback) ->
    info.buffer.push "<!--ebnd:#{@_pcid}-->"


module.exports = Bindable