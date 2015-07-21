
/**
 */

module.exports = {
  template    : require("./template"),
  transpile   : require("./transpiler").transpile,
  Attribute   : require("./attributes/base"),
  Component   : require("./components/base"),
  noConflict: function() {
    delete global.paperclip;
  }
};

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}
