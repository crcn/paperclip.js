var protoclass = require("protoclass");

/**
 */

function Reference(view, path, settable) {
  this.view     = view;
  this.path     = path;
  this.settable = settable !== false;
}

/**
 */

protoclass(Reference, {

  /**
   */

  __isReference: true,

  /**
   */

  value: function(value) {
    if (!arguments.length) return this.view.get(this.path);
    if (this.settable) this.view.set(this.path, value);
  },

  /**
   */

  toString: function() {
    return this.view.get(this.path);
  }
});

module.exports = Reference;
