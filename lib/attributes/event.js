var Base   = require("./base");
var extend = require("xtend/mutable");

/**
 */

function EventAttribute(ref, key, value, options) {
  Base.call(this, ref, key, value, options);
  this.event = key.toLowerCase().match(/on(.+)+/)[1];
}

/**
 */

extend(EventAttribute.prototype, Base.prototype, {
  didChange: function() {
    if (this.oldValue) this.ref.removeEventListener(this.event, this.oldValue);
    this.ref.addEventListener(this.event, this.value);
  }
});

/**
 */

module.exports = EventAttribute;
