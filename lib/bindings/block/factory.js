extend = require("../../utils/extend");


module.exports = function () {

  var blockBindings = extend({}, {
    condition: require("./condition"),
    html: require("./html")
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