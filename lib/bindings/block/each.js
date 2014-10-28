var BaseBlockBinding = require("./base");

// TODO - need to create own context which inherits properties
// TODO - ability to set property for each value {{#each:{ source: source, as: 'name'}}}

module.exports = BaseBlockBinding.extend({
  didChange: function (source) {

    if (!this._children) this._children = [];

    for (var i = 0, n = source.length; i < n; i++) {

      if (i < this._children.length) {
        this._children[i].bind({ model: source[i] });
      } else {
        var child = this.contentTemplate.bind({ model: source[i] });
        this._children.push(child);
        this.section.appendChild(child.render());
      }
    }

    // TODO - easeOutSync?
    this._children.splice(i).forEach(function (child) {
      child.remove();
    });
  }
});