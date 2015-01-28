var nofactor = require("nofactor");

var paperclip = module.exports = {

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

  components : {
    repeat : require("./components/repeat"),
    stack  : require("./components/stack")
  },

  /*


    "click", 
    "load", 
    "submit", 
    "mouseDown", 
    "mouseMove", 
    "mouseUp",
    "mouseOver",
    "mouseOut",
    "focusIn:focus",
    "focusOut:blur",
    "keyDown",
    "keyUp"

    */

  /**
   */

  attributes : {
    value        : require("./attributes/value"),
    enable       : require("./attributes/enable"),
    focus        : require("./attributes/focus"),
    show         : require("./attributes/show"),
    style        : require("./attributes/style"),
    class        : require("./attributes/class"),

    // events
    onClick       : require("./attributes/event"),
    onDoubleClick : require("./attributes/event"),
    onFocus       : require("./attributes/event"),
    onLoad        : require("./attributes/event"),
    onSubmit      : require("./attributes/event"),
    onMouseDown   : require("./attributes/event"),
    onChange      : require("./attributes/event"),
    onMouseUp     : require("./attributes/event"),
    onMouseOver   : require("./attributes/event"),
    onMouseOut    : require("./attributes/event"),
    onFocusIn     : require("./attributes/event"),
    onFocusOut    : require("./attributes/event"),
    onMouseMove   : require("./attributes/event"),
    onKeyDown     : require("./attributes/event"),
    onKeyUp       : require("./attributes/event"),
    
    onEnter       : require("./attributes/enter"),
    onDelete      : require("./attributes/delete"),
    onEscape      : require("./attributes/escape")
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