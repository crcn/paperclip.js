pcid = 0

exports.startBindingBlock = (node, info) ->
  info.buffer.push "<!--spc:#{node._pcid = ++pcid}-->"

exports.endBindingBlock = (node, info) ->
  info.buffer.push "<!--epc:#{node._pcid}-->"

