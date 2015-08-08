var template       = require("./template");
var extend         = require("xtend/mutable");

/**
 */

module.exports = {
  Attribute      : require("./attributes/base"),
  Component      : require("./components/base"),
  viewClass      : require("./view"),
  components     : require("./components"),
  attributes     : require("./attributes"),
  modifiers      : require("./modifiers"),
  document       : global.document,
  noConflict: function() {
    delete global.paperclip;
  },
  template: function(source, options) {
    return template(source, extend({}, module.exports, options || {}));
  }
};

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}
