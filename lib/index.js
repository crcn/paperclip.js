var paperclip = module.exports = {

  /**
   * web component base class
   */

  Component : require("./components/base"),

  /**
   */

  Attribute : require("./attributes/base"),

  /**
   * template factory
   */

  template  : require("./template"),

  /**
   */

  components : {
    repeat : require("./components/repeat"),
    stack  : require("./components/stack")
  }
};


if (typeof window !== "undefined") {

  window.paperclip = paperclip;

  // no conflict mode. Release paperclip from global scope.
  window.paperclip.noConflict = function () {
    delete window.paperclip;
    return paperclip;
  }
}