###
 Deprecated in favor of enable.coffee
###

class DisableAttrBinding extends require("./base")

  ###
  ###
  
  _onChange: (value) -> 

    if value
      @node.setAttribute("disabled", "disabled")
    else
      @node.removeAttribute("disabled")


module.exports = DisableAttrBinding