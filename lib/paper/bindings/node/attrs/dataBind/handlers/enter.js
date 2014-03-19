var EventDataBinding = require("./event");

function EnterAttrBinding () {
  EventDataBinding.apply(this, arguments);
}


EventDataBinding.extend(EnterAttrBinding, {
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {
    if (!~[13].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

module.exports = EnterAttrBinding;
