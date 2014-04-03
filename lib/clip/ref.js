var protoclass = require("protoclass"),
_              = require("underscore");


function BindableReference (clip, path) {
  this.clip     = clip;
  this.path     = path;
}

protoclass(BindableReference, {
  __isBindableReference: true,
  value: function (value) {
    if (!arguments.length) return this.clip.get(this.path);
    this.clip.set(this.path, value);
  },
  toString: function () {
    return this.clip.get(this.path);
  }
});


module.exports = BindableReference;
