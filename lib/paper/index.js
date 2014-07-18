var Clip           = require("../clip"),
template           = require("./template"),
nofactor           = require("nofactor"),
defaultModifiers   = require("./modifiers"),
bindings           = require("./bindings"),
bindable           = require("bindable"),
Application        = require("mojo-application");

module.exports = function () {

  var modifiers = defaultModifiers(), 
  self;

  var blockBinding = bindings.blockBindingFactory(),
  noeBinding       = bindings.nodeBindingFactory();

  var self = {

    /**
     */

    modifiers: modifiers,

    /*
     registers a binding modifier 
     {{ message | titlecase() }}
     */

    modifier: function (name, modifier) {
      return modifiers[name] = modifier;
    },

    /**
     */

    blockBindingFactory: blockBinding,

    /**
     */

    nodeBindingFactory: noeBinding,

    /*
     adds a block binding class
     {{#custom}}
     {{/}}
     */

    blockBinding: blockBinding.register,

    /*
     adds a node binding shim
     <custom />
     <div custom="" />
     */

    nodeBinding: noeBinding.register,

    /*
      data-bind="{{ custom: binding }}"
     */

    attrDataBinding: noeBinding.dataBind.register,

    /*
     */

    use: function(fn) {
      return fn(this);
    }
  }

  self.template = template(self);

  return self;
};

module.exports.Clip                = Clip;
module.exports.Application         = Application;
module.exports.BaseBlockBinding    = bindings.BaseBlockBinding;
module.exports.BaseNodeBinding     = bindings.BaseNodeBinding;
module.exports.BaseAttrDataBinding = bindings.BaseAttrDataBinding;

