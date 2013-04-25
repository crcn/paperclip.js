pcid = 0

class Bindable extends require("./base")
  
  ###
  ###

  _writeHead: (info, callback) ->
    info.buffer.push "<!--sbnd:#{++pcid}-->"

  ###
  ###

  _writeTail: (info, callback) ->
    info.buffer.push "<!--ebnd:#{++pcid}-->"


module.exports = Bindable