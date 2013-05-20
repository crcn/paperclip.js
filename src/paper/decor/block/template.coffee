# {{template:{name:"ablah", source: "/source.js" }}}
# OR
# {{#template:{name"ablah"}}}
# blah
# {{/}}


class TemplateDecor extends require("./base")

  ###
  ###

  load: (context, callback) ->
    context.internal.set("template.#{@clip.get("template.name") or @clip.get("template")}", @)
    callback()



  

module.exports = TemplateDecor