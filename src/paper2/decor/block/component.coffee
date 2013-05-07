# {{component:{name:"ablah", source: "/source.js" }}}
# OR
# {{#component:{name"ablah"}}}
# blah
# {{/}}


class ComponentDecor extends require("./base")
  
  ###
  ###

  @scriptName: "component"

  ###
  ###

  load: (context, callback) ->
    tplName = "template.#{@clip.get("component.name") or @clip.get("component")}"
    tpl = context.internal.get(tplName)
    return callback() if not tpl
    child = context.child().detachBuffer()

    onContentLoad = () =>
      child.set "content", child.buffer.join("")
      child.attachBuffer()
      tpl.write child, callback

    if @node.content
      @node.content.load child, onContentLoad
    else 
      onContentLoad()
  

module.exports = ComponentDecor