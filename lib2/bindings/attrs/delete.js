var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[8].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});
