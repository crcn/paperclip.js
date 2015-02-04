var nofactor    = require("nofactor"),
parser          = require("./parser"),
defaults        = require("./defaults");


if (!process.browser) {
  require("./register");
}


var paperclip = module.exports = {

  /**
   */

  Scope: require("./scope/base"),

  /**
   */

  runloop: defaults.runloop,

  /**
   */

  scopeClass: require("./scope/bindableObject"),

  /**
   */

  nodeFactory: nofactor.default,

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

  components : defaults.components,

  /**
   */

  attributes : defaults.attributes,

  /**
   */

  modifiers: defaults.modifiers,

  /**
   */

  parse: parser.parse
};


if (typeof window !== "undefined") {

  window.paperclip = paperclip;

  // no conflict mode. Release paperclip from global scope.
  window.paperclip.noConflict = function () {
    delete window.paperclip;
    return paperclip;
  }
}