


class ParseWriter extends require("./base")

  ###
  ###

  write: (source) =>  

    if typeof window isnt "undefined"

      # create the DOM element here first
      element = @nodeFactory.createElement "div"
      element.innerHTML = source
    else
      element = @nodeFactory.createTextNode source

    element




module.exports = ParseWriter