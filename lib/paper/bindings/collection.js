var BaseBinding = require("./base/binding");

function BindingCollection (node, source) {
    this._source = source || [];
}

BaseBinding.extend(BindingCollection, {
  push: function () {
    this._source.push.apply(this._source, arguments);
  },
  bind: function (context, node) {
    for (var i = 0, n = this._source.length; i < n; i++) {
      this._source[i].bind(context, node);
    }
  },
  unbind: function () {
    for (var i = 0, n = this._source.length; i < n; i++) {
      this._source[i].unbind();
    }
  }
});

module.exports = BindingCollection;
