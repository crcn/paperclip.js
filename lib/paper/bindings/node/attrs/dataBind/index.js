var Clip          = require("../../../../../clip"),
BindingCollection = require("../../../collection"),
BaseBinding       = require("../../base"),
_                 = require("underscore");

var defaultDataBindingClasses = {
  show    : require("./handlers/show"),
  css     : require("./handlers/css"),
  style   : require("./handlers/style"),
  focus   : require("./handlers/focus"),

  disable : require("./handlers/disable"),
  enable  : require("./handlers/enable"),
  model   : require("./handlers/model"),

  onClick      : require("./handlers/event"),
  onDblClick   : require("./handlers/event"),
  onLoad       : require("./handlers/event"),
  onSubmit     : require("./handlers/event"),
  onMouseDown  : require("./handlers/event"),
  onMouseMove  : require("./handlers/event"),
  onMouseUp    : require("./handlers/event"),
  onMouseOver  : require("./handlers/event"),
  onMouseOut   : require("./handlers/event"),
  onFocusIn    : require("./handlers/event"),
  onFocusOut   : require("./handlers/event"),
  onKeyDown    : require("./handlers/event"),
  onKeyUp      : require("./handlers/event"),
  onEnter      : require("./handlers/enter"),
  onEscape     : require("./handlers/escape"),
  onChange     : require("./handlers/change"),
  onDelete     : require("./handlers/delete"),
  _default     : require("./handlers/default")
}


function AttrDataBinding (options) {

  BaseBinding.call(this, options);

  this.clip = new Clip({
    scripts     : options.value[0],
    watch       : false,
    application : options.application
  });

  this._bindings = new BindingCollection();

  var dataBindingClasses = options.application.paperclip.attrDataBindingFactory.dataBindingClasses;

  for (var i = 0, n = this.clip.scripts.names.length; i < n; i++) {
    var scriptName = this.clip.scripts.names[i],
    bc = dataBindingClasses[scriptName] || defaultDataBindingClasses._default;
    this._bindings.push(new bc(options.application, this.node, this.clip, scriptName));
  }
}

BaseBinding.extend(AttrDataBinding, {
  type: "attr",
  bind: function (context) {
    this.context = context;
    this.clip.reset(context, false);
    this._bindings.bind(context);
  },
  update: function () {
    this._bindings.update();
  },
  unbind: function () {
    this._bindings.unbind();
    this.clip.dispose();
  }
});

module.exports = AttrDataBinding;


module.exports.factory = function (app) {
  var dataBindingClasses = app.pcNodeDataBindClasses = _.extend({}, defaultDataBindingClasses);
  return {
    dataBindingClasses: dataBindingClasses,
    register: function (name, dataBindClass) {
      dataBindingClasses[name] = dataBindClass;
    }
  }
}
