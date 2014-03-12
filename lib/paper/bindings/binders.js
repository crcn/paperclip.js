var BaseBinding   = require("./base/binding"),
BindingCollection = require("./collection");


function BinderCollection (node, source) {
  this.node    = node;
  this._source = source || [];
}

BaseBinding.extend(BinderCollection, {
  push: function () {
    this._source.push.apply(this._source, arguments);
  },
  getBindings: function (node) {

    if (this._source.length === 1) {
      return this._source[0].getBinding(node);
    }

    var bindings = new BindingCollection();
    for (var i = 0; i < this._source.length; i++) {
      bindings.push(this._source[i].getBinding(node));
    }
    return bindings;
  },
  init: function () {
    for (var i = 0, n = this._source.length; i < n; i++) {
      this._source[i].init();
    }
  }
});

module.exports = BinderCollection;
