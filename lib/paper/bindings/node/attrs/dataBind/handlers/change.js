var EventDataBinding = require("./event"),
_                    = require("underscore");

function ChangeAttrBinding () {
  EventDataBinding.apply(this, arguments);
}

ChangeAttrBinding.events = "keydown change input mousedown mouseup click";

EventDataBinding.extend(ChangeAttrBinding, {
  preventDefault: false,
  event: ChangeAttrBinding.events,
  _update: function (event) {
    clearTimeout(this._changeTimeout);
    this._changeTimeout = setTimeout(_.bind(this._update2, this), 5);
  },
  _update2: function () {
    this.script.update();
  }
});

module.exports = ChangeAttrBinding;
