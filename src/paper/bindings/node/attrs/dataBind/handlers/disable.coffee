class DisableAttrBinding extends require("./base")

  ###
  ###
  
  _onChange: (value) -> 

    if value
      @node.setAttribute("disable", "disable")
    else
      @node.removeAttribute("disable")


module.exports = DisableAttrBinding