module.exports = function (app) {
  return {
    blockBindingFactory : require("./block/factory")(app),
    nodeBindingFactory  : require("./node/factory")(app)
  }
}

module.exports.BaseBlockBinding    = require("./block/base");
module.exports.BaseNodeBinding     = require("./node/base");
module.exports.BaseAttrBinding     = require("./node/attrs/text");
module.exports.BaseAttrDataBinding = require("./node/attrs/dataBind/handlers/base");
