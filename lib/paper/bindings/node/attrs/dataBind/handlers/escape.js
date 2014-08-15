var EventDataBinding = require("./event");

function EscapeAttrBinding () {
  EventDataBinding.apply(this, arguments);
}


EventDataBinding.extend(EscapeAttrBinding, {
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[27].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

module.exports = EscapeAttrBinding;
