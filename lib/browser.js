var template       = require("./template");
var extend         = require("xtend/mutable");
var RunLoop        = require("./runloop");

/**
 */

module.exports = {
  Attribute  : require("./attributes/base"),
  Component  : require("./components/base"),
  viewClass  : require("./view"),
  compile    : require("./parsers/default/compiler").compile,
  components : require("./components"),
  attributes : require("./attributes"),
  modifiers  : require("./modifiers"),
  runloop    : new RunLoop(),
  vnode      : require("./vnode"),
  document   : global.document,
  noConflict: function() {
    delete global.paperclip;
  },
  template: function(source, options) {
    return template(source, extend({}, module.exports, options || {}));
  }
};

/**
 */

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}
