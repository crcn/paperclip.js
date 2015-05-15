var Runloop       = require("./runloop");
var POJOAccessor  = require("./accessors/pojo");

module.exports = {

  /**
   * Scope class to use for paperclip - allows for other frameworks
   * to hook into paperclip.
   */

  accessorClass: POJOAccessor,

  /**
   */

  accessors: {
    pojo: require("./accessors/pojo")
  },

  /**
   * Default "web" components
   */

  components : {
    repeat : require("./components/repeat"),
    stack  : require("./components/stack"),
    switch : require("./components/switch"),
    show   : require("./components/show"),
    unsafe : require("./components/unsafe")
  },

  /**
   * default attribute helpers (similar to angular directives)
   */

  attributes : {
    value        : require("./attributes/value"),
    checked      : require("./attributes/value"),
    enable       : require("./attributes/enable"),
    focus        : require("./attributes/focus"),
    style        : require("./attributes/style"),
    class        : require("./attributes/class"),
    easein       : require("./attributes/easeIn"),
    easeout      : require("./attributes/easeOut"),

    // events
    onclick       : require("./attributes/event"),
    ondoubleclick : require("./attributes/event"),
    onfocus       : require("./attributes/event"),
    onload        : require("./attributes/event"),
    onsubmit      : require("./attributes/event"),
    onmousedown   : require("./attributes/event"),
    onchange      : require("./attributes/event"),
    onmouseup     : require("./attributes/event"),
    onmouseover   : require("./attributes/event"),
    onmouseout    : require("./attributes/event"),
    onfocusin     : require("./attributes/event"),
    onfocusout    : require("./attributes/event"),
    onmousemove   : require("./attributes/event"),
    onkeydown     : require("./attributes/event"),
    onkeyup       : require("./attributes/event"),

    // additional events
    onenter       : require("./attributes/enter"),
    ondelete      : require("./attributes/delete"),
    onescape      : require("./attributes/escape")
  },

  /**
   * runs async operations
   */

  runloop: new Runloop({
    tick: process.env.PC_DEBUG ? process.nextTick : process.env.browser ? void 0 : void 0
  }),

  /**
   * {{ block | modifiers }}
   */

  modifiers: {
    uppercase: function(value) {
      return String(value).toUpperCase();
    },
    lowercase: function(value) {
      return String(value).toLowerCase();
    },
    titlecase: function(value) {
      var str;

      str = String(value);
      return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
    json: function(value, count, delimiter) {
      return JSON.stringify.apply(JSON, arguments);
    },
    isNaN: function(value) {
      return isNaN(value);
    },
    round: Math.round
  }
};
