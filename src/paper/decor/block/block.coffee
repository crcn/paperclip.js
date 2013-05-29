###

{{#block:"blockContent"}}
  hello world!
{{/}}

{{html:blockContent}}

###


class BlockDecor extends require("./base")
  
  ###
  ###

  load: (context) ->
    context.set(@clip.get("block"), @node)






module.exports = BlockDecor