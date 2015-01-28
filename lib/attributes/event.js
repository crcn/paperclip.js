var protoclass = require("protoclass"),
_bind          = require("../utils/bind"),
Base           = require("./base");

/**
 */

function EventAttribute (options) {
  Base.call(this, options);
  this._onEvent = _bind(this._onEvent, this);
}

/**
 */

Base.extend(EventAttribute, {

  /**
   */

  initialize: function () {

  },

  /**
   */

  bind: function (context) {
    Base.prototype.bind.call(this, context);

    // convert onEvent to event
    var event = this.event || (this.event = this.key.toLowerCase().replace(/^on/, ""));

    this.node.addEventListener(event, this._onEvent);
  },

  /**
   */

  _onEvent: function (event) {
    event.preventDefault();
    this.context.event = event;
    this.value.evaluate(this.context);
  },

  /**
   */
   
  unbind: function () {
    this.node.removeEventListener(this.event, this._onEvent);
  }
});

module.exports = EventAttribute;