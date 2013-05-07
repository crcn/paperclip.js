# HTML section for 
class HtmlDecor extends require("./base")
  

  ###
  ###

  load: (context, callback) ->
    html = @clip.get("html")
    return callback() if not html?
    if typeof html is "string"
      context.buffer.push html
      callback()
    else
      html.load context, callback


module.exports = HtmlDecor