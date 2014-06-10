var protoclass = require("protoclass"),
_              = require("underscore");


function BindableReference (clip, path, settable) {
  this.clip     = clip;
  this.path     = path;
  this.settable = settable;
}

protoclass(BindableReference, {
  __isBindableReference: true,
  value: function (value) {
    if (!arguments.length) return this.clip.get(this.path);
    if (this.settable) this.clip.set(this.path, value);
  },
  toString: function () {
    return this.clip.get(this.path);
  }
});


module.exports = BindableReference;
