var Clip  = require("../clip"),
template  = require("./template"),
nofactor  = require("nofactor"),
modifiers = require("./modifiers"),
bindings  = require("./bindings"),
bindable  = require("bindable");

module.exports = {

  /*
   */
  Clip: Clip,

  /*
   */

  bindable: bindable,

  /*
   parses a template
   */

  template: template,

  /*
   registers a binding modifier 
   {{ message | titlecase() }}
   */

  modifier: function (name, modifier) {
    return modifiers[name] = modifier;
  },

  /*
   expose the class so that one can be registered
   */

  BaseBlockBinding: bindings.BaseBlockBinding,

  /*
   */

  BaseNodeBinding: bindings.BaseNodeBinding,

  /*
   */

  BaseAttrDataBinding: bindings.BaseAttrDataBinding,

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

  /*
   */
  use: function(fn) {
    return fn(this);
  }
};
