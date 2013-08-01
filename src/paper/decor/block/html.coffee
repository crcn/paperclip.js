# HTML section for 
class HtmlDecor extends require("./base")
  

  ###
  ###

  load: (context) ->
    html = @clip.get("html")
    return if not html?
    if typeof html is "string" or not html.createContent
      context.buffer.push html
    else
      @child = html.createContent()
      @child.load context

  ###
  ###

  bind: () ->
    super()
    @clip.bind "html", @_onChange
    @child?.bind()


  ###
  ###

  _onChange: (value) ->
    if typeof html is "string"
      @node.section?.html value


  ###
  ###

  dispose: () ->
    super()
    @child?.dispose()


module.exports = HtmlDecor