# {{template:{name:"ablah", source: "/source.js" }}}
# OR
# {{#template:{name"ablah"}}}
# blah
# {{/}}


class TemplateDecor extends require("./base")

  ###
  ###

  load: (context) ->
    context.internal.set("template.#{@clip.get("template.name") or @clip.get("template")}", @)



  

module.exports = TemplateDecor