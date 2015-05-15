var EventDataBinding = require("./event");

/**
 */

module.exports = EventDataBinding.extend({

  /**
   */

  event: "keydown",

  /**
   */

  keyCodes: [],

  /**
   */

  _onEvent: function(event) {

    if (!~this.keyCodes.indexOf(event.keyCode)) {
      return;
    }

    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});
