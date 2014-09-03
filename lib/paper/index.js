var Clip         = require("../clip"),
template         = require("./template"),
nofactor         = require("nofactor"),
defaultModifiers = require("./modifiers"),
bindings         = require("./bindings"),
bindable         = require("bindable"),
_                = require("underscore");

module.exports = function (app) {

  var modifiers = _.extend({}, defaultModifiers);

  return app.paperclip = {

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

    /*
     adds a block binding class
     {{#custom}}
     {{/}}
     */

    blockBinding: bindings.blockBindingFactory.register,

    /*
     adds a node binding shim
     <custom />
     <div custom="" />
     */

    nodeBinding: bindings.nodeBindingFactory.register,

    /*
      data-bind="{{ custom: binding }}"
     */

    attrDataBinding: bindings.nodeBindingFactory.dataBind.register,

    /**
     */

    use: function(fn) {
      return fn(this);
    }
  };
}

module.exports.Clip                = Clip;
module.exports.template            = template;
module.exports.Application         = require("mojo-application");
module.exports.BaseBlockBinding    = bindings.BaseBlockBinding;
module.exports.BaseNodeBinding     = bindings.BaseNodeBinding;
module.exports.BaseAttrBinding     = bindings.BaseAttrBinding;
module.exports.BaseAttrDataBinding = bindings.BaseAttrDataBinding;
