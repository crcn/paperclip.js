pilot  = require "pilot-block"  

_pcid = 0

class BindableNode extends require("./base")
  
  ###
  ###

  bind: () ->
    super()
    @section = pilot.section @id
    @


  ###
  ###

  _writeHead: (context, callback) ->
    @_writeStartBlock context
    super context, callback

  ###
  ###

  _writeStartBlock: (context) ->
    context.buffer.push "<!--spc:#{@id = ++_pcid}-->"

  ###
  ###

  _writeTail: (context, callback) ->
    @_writeEndBlock context
    super context, callback


  ###
  ###

  _writeEndBlock: (context) ->
    context.buffer.push "<!--epc:#{@id}-->"


module.exports = BindableNode



