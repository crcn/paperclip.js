var defaultAdapter = require("./adapters/default");
var template       = require("./template");
var extend         = require("xtend/mutable");

/**
 */

module.exports = {
  transpile   : require("./transpiler").transpile,
  Attribute   : require("./adapters/default/attributes/base"),
  Component   : require("./adapters/default/components/base"),
  noConflict: function() {
    delete global.paperclip;
  },
  template: function(source, adapter) {
    return template(source, extend({}, defaultAdapter, adapter || {}));
  }
};

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}
