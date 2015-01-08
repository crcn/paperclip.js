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
  unbind: function () {
    BaseBlockBinding.prototype.unbind.call(this);
    if (this._updateListener) this._updateListener.dispose();
  },
  didChange: function (source) {

    if (this._updateListener) this._updateListener.dispose();

    var name = this.scripts.as ? this.scripts.as.evaluate(this.context) : void 0;

    if (!source) source = [];

    if (source.__isBindableCollection) {

      var self = this, collection = source;

      this._updateListener = source.once("update", function () {
        self.didChange(collection);
      });

      source = source.source;
    }

    if (!this._children) this._children = [];
    var self = this;

    for (var i = 0, n = source.length; i < n; i++) {

      if (name) {

        var props = new BindableObject();
        props[name] = source[i];
        props.index = i;

        // dirty - inherit props
        props.get = function (path) {
          if (this[path[0]] != null) return BindableObject.prototype.get.call(this, path);
          var ret = self.context.get(path);

          if (typeof ret === "function") {
            return function () {
              return ret.apply(self.context, arguments);
            }
          }

          return ret;
        }
      } else {
        var props = source[i];
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