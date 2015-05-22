
/**
 */

module.exports = {
  template: require("./template"),
  noConflict: function() {
    delete global.paperclip;
  }
};

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}
