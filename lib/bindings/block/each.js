var BaseBlockBinding = require("./base");

// TODO - need to create own context which inherits properties
// TODO - ability to set property for each value {{#each:{ source: source, as: 'name'}}}

module.exports = BaseBlockBinding.extend({
  didChange: function (source) {

    var name = this.scripts.as ? this.scripts.as.evaluate(this.context) : "model";

    if (!this._children) this._children = [];

    for (var i = 0, n = source.length; i < n; i++) {

      var props = {};
      props[name] = source[i];

      if (i < this._children.length) {
        this._children[i].bind(props);
      } else {
        var child = this.contentTemplate.bind(props);
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