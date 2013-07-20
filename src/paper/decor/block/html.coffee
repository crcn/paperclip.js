# HTML section for 
class HtmlDecor extends require("./base")
  

  ###
  ###

  load: (context) ->
    html = @clip.get("html")
    return if not html?
    console.log html
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

  unbind: () ->
    super()
    @child?.unbind()


module.exports = HtmlDecor