var extend = require("xtend/mutable");;

/**
 */

function Base(ref, key, value, options) {
  this.ref     = ref;
  this.key     = key;
  this.value   = value;
  this.options = options;
  this.update();
}

/**
 */

extend(Base.prototype, {
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
