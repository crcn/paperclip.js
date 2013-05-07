###

{{#block:"blockContent"}}
  hello world!
{{/}}

{{html:blockContent}}

###


class BlockDecor extends require("./base")
  
  ###
  ###

  load: (context, callback) ->
    context.set(@clip.get("block"), @node.content)
    callback()


module.exports = BlockDecor