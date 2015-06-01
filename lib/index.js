
/**
 */

module.exports = {
  template    : require("./template"),
  transpile   : require("./transpiler").transpile,
  noConflict: function() {
    delete global.paperclip;
  }
};

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}
