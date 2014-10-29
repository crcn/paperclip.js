var protoclass = require("protoclass");

/**
 * bindings specific to the view
 */

function Bindings () {
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
    if (this._bound) this.unbind();
    this._bound = true;
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].bind(context);
    }
  },

  /**
   */

  unbind: function () {
    this._bound = false;
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].unbind();
    }
  }
});

module.exports = Bindings;