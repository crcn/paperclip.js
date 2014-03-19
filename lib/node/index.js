var pc        = require("../browser"),
blockBindings = require("./paper/bindings/block");

for (name in blockBindings) {
  pc.blockBinding(name, blockBindings[name]);
}