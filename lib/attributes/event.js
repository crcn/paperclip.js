var DefaultEventDataBinding = require("./defaultEvent");

/**
 */

module.exports = DefaultEventDataBinding.extend({

  /**
   */

  _onEvent: function(event) {
    event.preventDefault();
    DefaultEventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});
