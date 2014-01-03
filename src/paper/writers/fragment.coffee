class FragmentWriter extends require("./base")

  ###
  ###

  write: (children) =>  
    return children[0] if children.length is 1
    @nodeFactory.createFragment children


module.exports = FragmentWriter