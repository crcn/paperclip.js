var protoclass = require("protoclass");

/**
 */

function Base(ref, key, value, options) {
  this.ref      = ref;
  this.node     = ref; // DEPRECATED
  this.key      = key;
  this.value    = value;
  this.options  = options;
  this.document = options.document;
  this.initialize();
}

/**
 */

protoclass(Base, {
  initialize: function() {
  },
  update: function() {
  },
  didChange: function() {
    // do stuff here
  }
});

/**
 */

module.exports = Base;
