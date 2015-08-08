var Base = require("./base");

/**
 */

module.exports = Base.extend({
  initialize: function() {
    if (!this.event) this.event = this.key.match(/on(.+)/)[1].toLowerCase();
    this.ref.addEventListener(this.event, this._onEvent.bind(this));
  },
  _onEvent: function(event) {
    this.value(event);
  }
});
