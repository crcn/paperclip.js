extend = require("../../utils/extend");

"<div data-onClick={{}}></div>"

module.exports = function () {

  var attrBindings = extend({}, {

    "show"   : require("./show"),
    "enable" : require("./enable"),
    "focus"  : require("./focus"),
    "model"  : require("./model"),
    // "bind-style"  : require("./style"),
    // "bind-class"  : require("./class"),



    "onClick"       : require("./event"),
    "onDoubleClick" : require("./event"),
    "onLoad"        : require("./event"),
    "onSubmit"      : require("./event"),
    "onMouseDown"   : require("./event"),
    "onMouseUp"     : require("./event"),
    "onMouseOver"   : require("./event"),
    "onMouseMove"   : require("./event"),
    "onMouseOut"    : require("./event"),
    "onFocusIn"     : require("./event"),
    "onFocusOut"    : require("./event"),
    "onKeyDown"     : require("./event"),
    "onKeyUp"       : require("./event"),

    "onEnter"       : require("./enter"),
    "onEscape"      : require("./escape"),
    "onChange"      : require("./event"),
    "onDelete"      : require("./delete"),
  });

  return {
    register: function (name, attrBinding) {
      attrBindings[name] = attrBinding;
    },
    getClass: function (name, attrValue) {
      var clazz = attrBindings[name];
      if (clazz && (!clazz.prototype.test || clazz.prototype.test(attrValue))) {
        return clazz;
      }
    }
  };
}