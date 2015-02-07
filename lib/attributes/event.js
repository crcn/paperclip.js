var protoclass = require("protoclass");
var _bind      = require("../utils/bind");
var Base       = require("./base");

/**
 */

function EventAttribute(options) {
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

  initialize: function() {
    // convert onEvent to event
    var event = this.event || (this.event = this.key.toLowerCase().replace(/^on/, ""));
    this.node.addEventListener(event, this._onEvent);
  },

  /**
   */

  bind: function() {
    Base.prototype.bind.call(this);
    this.bound = true;
  },

  /**
   */

  _onEvent: function(event) {
    if (!this.bound) return;
    event.preventDefault();
    this.view.set("event", event);
    this.value.evaluate(this.view);
  },

  /**
   */

  unbind: function() {
    this.bound = false;
  }
});

module.exports = EventAttribute;
