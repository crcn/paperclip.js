var Application          = require("mojo-application"),
template                 = require("./template"),
BaseBlockBinding         = require("./bindings/block/base"),
createBlockBindingFacory = require("./bindings/block/factory");

module.exports = function (app) {

  if (!app) app = Application.main;
  if (app.paperlip) return app.paperlip;

  var _modifiers = {},
  blockBindingFactory = createBlockBindingFacory(app);

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

    blockBindingFactory: blockBindingFactory

  };
}


var pc = global.paperclip = module.exports();

for (var key in pc) {
  module.exports[key] = pc[key];
}


module.exports.BaseBlockBinding = BaseBlockBinding;
