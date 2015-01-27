var BaseComponent  = require("./base"),
BindableCollection = require("bindable-collection"),
BindableObject     = require("bindable-object");

function RepeatComponent (options) {
  BaseComponent.call(this, options);
}

module.exports = BaseComponent.extend({
  update: function () {
    if (this._updateListener) this._updateListener.dispose();

    var name = this.attributes.as,
    source   = this.attributes.each;

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

        var context = new BindableObject();
        context[name] = source[i];
        context.index = i;

        // dirty - inherit props
        context.get = function (path) {
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
        var context = source[i];
      }


      if (i < this._children.length) {
        this._children[i].bind(context);
      } else {
        var child = this.childTemplate.view(context);
        this._children.push(child);
        this.section.appendChild(child.render());
      }
    }

    // TODO - easeOutSync?
    this._children.splice(i).forEach(function (child) {
      child.remove();
    });
  },
  updateChildren: function () {

  }
});