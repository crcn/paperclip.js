var EventDataBinding = require("./event");

function DeleteAttrBinding () {
  EventDataBinding.apply(this, arguments);
}


EventDataBinding.extend(DeleteAttrBinding, {
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {
    if (!~[8].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

module.exports = DeleteAttrBinding;
