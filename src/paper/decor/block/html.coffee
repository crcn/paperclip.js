# HTML section for 
class HtmlDecor extends require("./base")
  

  ###
  ###

  load: (context, callback) ->
    html = @clip.get("html")
    return callback() if not html?
    if typeof html is "string" or html?.__isSection
      context.buffer.push html
      callback()
    else
      @child = html.createContent()
      @child.load context, callback

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