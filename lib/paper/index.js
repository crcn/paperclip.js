var Clip         = require("../clip"),
template         = require("./template"),
nofactor         = require("nofactor"),
defaultModifiers = require("./modifiers"),
bindings         = require("./bindings"),
bindable         = require("bindable"),
_                = require("underscore"),
Application      = require("mojo-application");

module.exports = function (app) {

   // already registered - just return it
  if (!app) app = Application.main;
  if(app.paperclip) return app.paperclip;

  var _modifiers = _.extend({}, defaultModifiers),
  _bindings      = bindings(app);

  return app.paperclip = {

    /**
     */

    modifiers: _modifiers,

    /*
     registers a binding modifier 
     {{ message | titlecase() }}
     */

    modifier: function (name, modifier) {
      return _modifiers[name] = modifier;
    },

    /**
     */

    template: function (source, rapp) {
      return template(source, rapp || app);
    },

    /*
     adds a block binding class
     {{#custom}}
     {{/}}
     */

    blockBinding: _.bind(_bindings.blockBindingFactory.register, _bindings.blockBindingFactory),

    /*
     adds a block binding class
     {{#custom}}
     {{/}}
     */

    blockBindingFactory: _bindings.blockBindingFactory,

    /*
     adds a node binding shim
     <custom />
     <div custom="" />
     */

    nodeBinding: _.bind(_bindings.nodeBindingFactory.register, _bindings.nodeBindingFactory),

    /**
     */

    nodeBindingFactory: _bindings.nodeBindingFactory,

    /*
      data-bind="{{ custom: binding }}"
     */

    attrDataBinding: _.bind(_bindings.nodeBindingFactory.dataBind.register, _bindings.nodeBindingFactory.dataBind),

    /**
     */

    attrDataBindingFactory: _bindings.nodeBindingFactory.dataBind,

    /**
     */

    use: function(fn) {
      return fn(this);
    }
  };
}

var pc = module.exports(Application.main);

for (var key in pc) {
    module.exports[key] = pc[key];
}

module.exports.Clip                = Clip;
module.exports.Application         = require("mojo-application");
module.exports.BaseBlockBinding    = bindings.BaseBlockBinding;
module.exports.BaseNodeBinding     = bindings.BaseNodeBinding;
module.exports.BaseAttrBinding     = bindings.BaseAttrBinding;
module.exports.BaseAttrDataBinding = bindings.BaseAttrDataBinding;
