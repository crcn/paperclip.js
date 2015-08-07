var defaultAdapter = require("./adapters/default");
var template       = require("./template");
var extend         = require("xtend/mutable");

/**
 */

module.exports = {
  Attribute   : require("./adapters/core/attributes/base"),
  Component   : require("./adapters/core/components/base"),
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
