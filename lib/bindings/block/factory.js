extend = require("../../utils/extend");


module.exports = function () {

  var blockBindings = extend({}, {
    "if": require("./condition"),
    "else": require("./else"),
    "elseif": require("./condition"),
    "html": require("./html"),
    "each": require("./each")
  });

  return {
    register: function (name, blockBinding) {
      blockBindings[name] = blockBinding;
    },
    getClass: function (name) {
      return blockBindings[name];
    }
  };
}