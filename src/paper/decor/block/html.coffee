# HTML section for 
class HtmlDecor extends require("./base")
  

  ###
  ###

  load: (stream) ->
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
    @child?.bind()

  ###
  ###

  dispose: () ->
    super()
    @child?.dispose()


module.exports = HtmlDecor