var protoclass = require("protoclass");

/**
 */

function Base(ref, key, value, options) {
  this.ref     = ref;
  this.node    = ref; // DEPRECATED
  this.key     = key;
  this.value   = value;
  this.options = options;
  this.document = options.document;
  this.initialize();
  this.update();
}

/**
 */

protoclass(Base, {
  initialize: function() {
    this.update();
  },
  update: function() {
    if (this.value === this.oldValue) return;
    this.didChange();
    this.oldValue = this.value;
  },
  didChange: function() {
    // do stuff here
  }
});

/**
 */

module.exports = Base;
