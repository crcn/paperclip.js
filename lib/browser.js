var nofactor = require("nofactor");
var defaults = require("./defaults");
var template = require("./template");
var parser   = require("./parser");

template.parser = parser;

var paperclip = module.exports = {

  /**
   */

  accessors: defaults.accessors,

  /**
   */

  runloop: defaults.runloop,

  /**
   */

  nodeFactory: nofactor,

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

  template  : template,

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
  window.paperclip.noConflict = function() {
    delete window.paperclip;
    return paperclip;
  };
}
