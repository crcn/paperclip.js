var protoclass = require("protoclass"),
_bind = require("../../utils/bind");

function EventAttrBinding (view, node, scripts, attrName) {
  this.view     = view;
  this.node     = node;
  this.scripts  = scripts;
  this.attrName = attrName;
  this._onEvent = _bind(this._onEvent, this);
}

protoclass(EventAttrBinding, {

  stopPropagation: true,
  preventDefault: false,

  /**
   */

  bind: function (context) {
    this.context = context;

    var event = (this.event || this.attrName).toLowerCase(),
    name      = this.attrName.toLowerCase();

    if (name.substr(0, 2) === "on") {
      name = name.substr(2);
    }

    if (event.substr(0, 2) === "on") {
      event = event.substr(2);
    }

    // this._updateScript(this.script("propagateEvent"));
    // this._updateScript(this.clip.script("preventDefault"));


    if (~["click", "mouseup", "mousedown", "submit"].indexOf(name)) {
      this.preventDefault  = true;
      this.stopPropagation = false;
    }

    this._pge = "propagateEvent." + name;
    this._pde = "preventDefault." + name;

    var self = this;

    (this._events = event.split(" ")).forEach(function (event) {
      self.node.addEventListener(event, self._onEvent);
    });
  },

  /**
   */

  _onEvent: function (event) {

    var pe, pd;

    if (this.scripts.stopPropagation == null) {
      pe = this.stopPropagation;
    } else {
      pe = this.scripts.stopPropagation.evaluate(this.context);
    }

    if (this.scripts.preventDefault == null) {
      pd = this.preventDefault;
    } else {
      pd = this.scripts.preventDefault.evaluate(this.context)
    }

    if (pe) event.stopPropagation();
    if (pd) event.preventDefault();

    if (this.node.disabled) return;
    this.context.set("event", event);
    this._update(event);
  },

  _update: function (event) {
    this.scripts.value.evaluate(this.context);
  },

  /**
   */

  unbind: function () {
    var self = this;
    (this._events || []).forEach(function (event) {
      self.node.removeEventListener(event, self._onEvent);
    });
  },

  /**
   */

  didChange: function () {
    // override me
  }
});

module.exports = EventAttrBinding;