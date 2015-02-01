module.exports = {
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

  modifiers: require("./defaultModifiers")
};