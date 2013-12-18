class TextWriter extends require("./base")

  ###
  ###

  write: (text) =>


    # HTML entities - use the browser to parse this shit out
    if ~text.indexOf("&") and /&.*?;/.test(text)
      # parses HTML entities properly - vanilla textNode doesn't do anything
      node = @nodeFactory.createElement "div"
      node.innerHTML = text
      return node.childNodes[0] or @nodeFactory.createTextNode text
    else
      return @nodeFactory.createTextNode text



module.exports = TextWriter