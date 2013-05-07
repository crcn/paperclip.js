# {{component:{name:"ablah", source: "/source.js" }}}
# OR
# {{#component:{name"ablah"}}}
# blah
# {{/}}


class ComponentDecor extends require("./base")
    
  ###
  ###

  bind: () ->
    super()
    @child.bind()
    console.log "BIND"

  ###
  ###

  dispose: () ->
    super()
    @child.dispose()


  ###
  ###

  load: (context, callback) ->
    tplName = "template.#{@clip.get("component.name") or @clip.get("component")}"
    wth = @clip.get("component.item") or undefined
    tpl = context.internal.get(tplName)
    return callback() if not tpl
    child = context.child().detachBuffer()

    onContentLoad = () =>
      child.set "content", child.buffer.join("")
      child.attachBuffer()
      @child = tpl.node.createContent()
      @child.load(child.child(wth), callback)

    if @node.content
      @node.content.load child, onContentLoad
    else 
      onContentLoad()
  

module.exports = ComponentDecor