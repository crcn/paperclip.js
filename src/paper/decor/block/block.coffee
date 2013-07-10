###

{{#block:"blockContent"}}
  hello world!
{{/}}

{{html:blockContent}}

###


class BlockDecor extends require("./base")
  
  ###
  ###

  load: (stream) ->
    stream.context.set(@clip.get("block"), @node)






module.exports = BlockDecor