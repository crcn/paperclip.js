var protoclass = require("protoclass");


function BindableReference (script, path, settable) {
  this.script   = script;
  this.path     = path;
  this.settable = settable;
}

protoclass(BindableReference, {
  __isBindableReference: true,
  value: function (value) {
    if (!arguments.length) return this.script.get(this.path);
    if (this.settable) this.script.set(this.path, value);
  },
  toString: function () {
    return this.script.get(this.path);
  }
});


module.exports = BindableReference;
