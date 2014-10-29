var BaseBlockBinding = require("./base"),
BindableObject       = require("bindable-object");

// TODO - need to create own context which inherits properties
// TODO - ability to set property for each value {{#each:{ source: source, as: 'name'}}}

module.exports = BaseBlockBinding.extend({
  bind: function (context) {
    BaseBlockBinding.prototype.bind.call(this, context);

    var allocate = this.scripts.allocate ? this.scripts.allocate.evaluate(this.context) : 0,
    chunk        = this.scripts.chunk    ? this.scripts.chunk.evaluate(this.context)    : allocate,
    delay        = this.scripts.delay    ? this.scrtips.delay.evaluate(this.context)    : 1;

    if (!allocate) return;

    var i = 0, self = this;

    function allocateItems () {
      while (i++ < chunk) {
        self.contentTemplate.bind().dispose();
      }

      if (i < allocate) setTimeout(allocateItems, delay);
    }

    allocateItems();
  },
  didChange: function (source) {

    var name;

    if (!source) source = [];

    if (!this.scripts.as || !(name = this.scripts.as.evaluate(this.context))) {
      throw new Error("'as' must be defined for #each statement")
    }

    if (source.__isBindableCollection) {
      source = source.source;
    }

    if (!this._children) this._children = [];
    var self = this;

    for (var i = 0, n = source.length; i < n; i++) {

      var props = new BindableObject();
      props[name] = source[i];

      // dirty - inherit props
      props.get = function (path) {
        if (this[path[0]]) return BindableObject.prototype.get.call(this, path);
        return self.context.get(path);
      }

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