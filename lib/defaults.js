var frameRunner = require("frame-runner");

module.exports = {

  /**
   */

  runner: frameRunner(
    process.browser ? void 0 : process.env.PC_DEBUG ? process.nextTick : void 0
  ),

  /**
   */

  components : {
    repeat : require("./components/repeat"),
    stack  : require("./components/stack"),
    switch : require("./components/switch"),
    show   : require("./components/show"),
    unsafe : require("./components/unsafe")
  },

  /**
   */

  attributes : {
    value        : require("./attributes/value"),
    checked      : require("./attributes/value"),
    enable       : require("./attributes/enable"),
    focus        : require("./attributes/focus"),
    show         : require("./attributes/show"),
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
    
    onenter       : require("./attributes/enter"),
    ondelete      : require("./attributes/delete"),
    onescape      : require("./attributes/escape")
  },

  /**
   */

  modifiers: {
    uppercase: function (value) {
      return String(value).toUpperCase();
    },
    lowercase: function (value) {
      return String(value).toLowerCase();
    },
    titlecase: function (value) {
      var str;

      str = String(value);
      return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
    json: function (value, count, delimiter) {
      return JSON.stringify.apply(JSON, arguments);
    },
    isNaN: function (value) {
      return isNaN(value);
    }
  }
};