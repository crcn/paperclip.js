pc = require("../browser")
blockBindings = require("./paper/bindings/block")


for name of blockBindings
  pc.blockBinding name, blockBindings[name]