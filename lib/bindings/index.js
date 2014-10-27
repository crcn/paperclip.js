var protoclass = require("protoclass");

/**
 * bindings specific to the view
 */

function Bindings (view) {
  this.view      = view;
  this._bindings = [];
}

protoclass(Bindings, {

  /**
   */

  push: function (clip) {
    this._bindings.push(clip);
  },

  /**
   */

  bind: function (context) {
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].bind(context);
    }
  }
});

module.exports = Bindings;