var Application          = require("mojo-application"),
template                 = require("./template"),
defaultModifiers         = require("./defaultModifiers"),
BaseBlockBinding         = require("./bindings/block/base"),
createBlockBindingFacory = require("./bindings/block/factory"),
createAttrBindingFactory = require("./bindings/attrs/factory"),
BaseAttrBinding          = require("./bindings/attrs/base"),
extend                   = require("./utils/extend");

if (!process.browser) {
  require("./register");
}

module.exports = function (app) {

  if (!app) app = Application.main;
  if (app.paperlip) return app.paperlip;

  var _modifiers = extend({}, defaultModifiers),
  blockBindingFactory = createBlockBindingFacory(app),
  attrBindingFactory  = createAttrBindingFactory(app);

  return app.paperclip = {

    /**
     */

    modifiers: _modifiers,

    /**
     */

    modifier: function (name, modifier) {
      _modifiers[name] = modifier;
    },

    /**
     */

    template: function (source, rapp) {
      return new template(source, rapp || app);
    },

    /**
     */

    blockBinding: blockBindingFactory.register,

    /**
     */

    blockBindingFactory: blockBindingFactory,

    /**
     */

    attrBinding: attrBindingFactory.register,

    /**
     */

    attrBindingFactory: attrBindingFactory
  };
}


var pc = global.paperclip = module.exports();

for (var key in pc) {
  module.exports[key] = pc[key];
}

module.exports.BaseBlockBinding = BaseBlockBinding;
module.exports.BaseAttrBinding  = BaseAttrBinding;
