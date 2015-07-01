var protoclass = require("protoclass");
var _bind = require("../utils/bind");
var Base = require("./base");

/**
 */

function DefaultEventAttribute(options) {
  this._onEvent = _bind(this._onEvent, this);
  Base.call(this, options);
}

/**
 */

Base.extend(DefaultEventAttribute, {

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
    this.view.set("event", event);
    this.value.evaluate(this.view);
  },

  /**
   */

  unbind: function() {
    this.bound = false;
  }
});

module.exports = DefaultEventAttribute;
