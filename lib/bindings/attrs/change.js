var EventDataBinding = require("./event"),
_bind                = require("../../utils/bind");

function ChangeAttrBinding () {
  EventDataBinding.apply(this, arguments);
}

ChangeAttrBinding.events = "change";

EventDataBinding.extend(ChangeAttrBinding, {
  preventDefault: false,
  event: ChangeAttrBinding.events,
  _update: function (event) {
    clearTimeout(this._changeTimeout);
    this._changeTimeout = setTimeout(_bind(this._update2, this), 5);
  },
  _update2: function () {
    this.scripts.value.evaluate(this.context);
  }
});

module.exports = ChangeAttrBinding;