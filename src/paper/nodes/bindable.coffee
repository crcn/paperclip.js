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

  _writeHead: (context) ->
    @_writeStartBlock context
    super context

  ###
  ###

  _writeStartBlock: (context) ->
    context.buffer.push "<!--spc:#{@id = ++_pcid}-->"

  ###
  ###

  _writeTail: (context) ->
    @_writeEndBlock context
    super context


  ###
  ###

  _writeEndBlock: (context) ->
    context.buffer.push "<!--epc:#{@id}-->"


module.exports = BindableNode



