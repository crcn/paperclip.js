class TextWriter extends require("./base")

  ###
  ###

  write: (text) =>

    # parses HTML entities properly - vanilla textNode doesn't do anything
    node = @nodeFactory.createElement "div"
    node.innerHTML = text


    node.childNodes[0] or @nodeFactory.createTextNode text


module.exports = TextWriter