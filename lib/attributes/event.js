var protoclass = require("protoclass"),
_bind          = require("../utils/bind"),
Base           = require("./base");

/**
 */

function EventAttribute (options) {
  this._onEvent = _bind(this._onEvent, this);
  Base.call(this, options);

  // TODO - register event handler on view. Don't attach
  // event handler on node here
}

/**
 */

Base.extend(EventAttribute, {

  /**
   */

  initialize: function () {
    // convert onEvent to event
    var event = this.event || (this.event = this.key.toLowerCase().replace(/^on/, ""));
    this.node.addEventListener(event, this._onEvent);
  },

  /**
   */

  bind: function (context) {
    Base.prototype.bind.call(this, context);
    this.bound = true;
  },

  /**
   */

  _onEvent: function (event) {
    if (!this.bound) return;
    event.preventDefault();
    this.context.event = event;
    this.value.evaluate(this.view, this.context);
  },

  /**
   */
   
  unbind: function () {
    this.bound = false;
  }
});

module.exports = EventAttribute;