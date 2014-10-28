extend = require("../../utils/extend");


module.exports = function () {

  var attrBindings = extend({}, {

    // "data-show" : require("./show"),
    // "data-class" : require("./show"),
    // "data-style" : require("./show"),
    // "data-disable" : require("./show"),
    // "data-enable" : require("./show"),
    // "data-model" : require("./show"),


    "onClick"       : require("./event"),
    "onDoubleClick" : require("./event"),
    "onLoad"        : require("./event"),
    "onSubmit"      : require("./event"),
    "onMouseDown"   : require("./event"),
    "onMouseUp"     : require("./event"),
    "onMouseOver"   : require("./event"),
    "onMouseOut"    : require("./event"),
    "onFocusIn"     : require("./event"),
    "onFocusOut"    : require("./event"),
    "onKeyDown"     : require("./event"),
    "onKeyUp"       : require("./event")

    // "onEnter"       : require("./event"),
    // "onEscape"      : require("./event"),
    // "onChange"      : require("./event"),
    // "onDelete"      : require("./event"),
  });

  return {
    register: function (name, attrBinding) {
      attrBindings[name] = attrBinding;
    },
    getClass: function (name) {
      return attrBindings[name];
    }
  };
}