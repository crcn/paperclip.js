class FragmentWriter extends require("./base")

  ###
  ###

  write: (children) => 
    @nodeFactory.createFragment children


module.exports = FragmentWriter