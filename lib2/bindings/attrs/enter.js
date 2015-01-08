var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[13].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});
