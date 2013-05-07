class BindableNode extends require("./base")
  
  ###
  ###

  bind: (@section) ->


  ###
  ###

  _writeHead: (context, callback) ->
    @_writeStartBlock context
    super context, callback

  ###
  ###

  _writeStartBlock: (context) ->
    context.internal.set("pcid", pcid = (context.internal.get("pcid") or 0) + 1)
    context.buffer.push "<!--spc:#{@id = pcid}-->"
    context.addBinding @

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



