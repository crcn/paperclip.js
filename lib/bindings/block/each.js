var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  didChange: function (source) {

    if (!this._children) this._children = [];

    var child;

    for (var i = 0, n = source.length; i < n; i++) {

      if (i < this._children.length) {
        child = this._children[i].bind({ model: source[i] });
      } else {
        child = this.contentTemplate.bind({ model: source[i] });
        this._children.push(child);
        this.section.appendChild(child.render());
      }
    }

    this._children.splice(i).forEach(function (child) {
      child.remove();
    });
  }
});