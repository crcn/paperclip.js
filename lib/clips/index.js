var protoclass = require("protoclass");

/**
 * Clips are the {{blocks}} that are defined int the template. These
 * are objects that get defined ONCE, then generate bindings which get "clipped"
 * onto views.
 */

function Clips (template) {
  this.template = template;
  this._clips   = [];
}

protoclass(Clips, {

  /**
   */

  push: function (clip) {
    this._clips.push(clip);
  },

  /**
   * called after the template node is created. Sets the clips
   * up to be re-used
   */

  prepare: function () {
    for (var i = this._clips.length; i--;) {
      this._clips[i].prepare();
    }
  },

  /**
   * hydrates the view with bindings
   */

  hydrate: function (view) {
    for (var i = this._clips.length; i--;) {
      this._clips[i].hydrate(view);
    }
  }
});

module.exports = Clips;