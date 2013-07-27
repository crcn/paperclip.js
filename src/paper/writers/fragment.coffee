attrFactory = require("../decor/attrFactory")


class ElementWriter extends require("./base")

  ###
  ###

  write: (children) => 
    @nodeFactory.createFragment children...




module.exports = ElementWriter