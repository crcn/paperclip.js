class EnableAttrBinding extends require("./base")

  ###
  ###
  
  _onChange: (value) -> 

    if value
      @node.removeAttribute("disabled")
    else
      @node.setAttribute("disabled", "disabled")


module.exports = EnableAttrBinding