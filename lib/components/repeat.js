var BaseComponent  = require("./base"),
BindableCollection = require("bindable-collection"),
BindableObject     = require("bindable-object"),
ScopedBindableObject = require("scoped-bindable-object");

/**
 * TODO: alloc property
 * TODO: chunk property
 */

function RepeatComponent (options) {
  BaseComponent.call(this, options);
}

/**
 */

module.exports = BaseComponent.extend({

  /**
   */

  update: function () {
    if (this._updateListener) this._updateListener.dispose();

    var name = this.attributes.as,
    source   = this.attributes.each;

    if (!source) source = [];

    if (source.__isBindableCollection) {

      var self = this, collection = source;

      this._updateListener = source.once("update", function () {
        // rAF
        self.view.runner.run(self);
      });

      source = source.source;
    }

    if (!this._children) this._children = [];
    var self = this;

    for (var i = 0, n = source.length; i < n; i++) {

      if (name) {
        var context   = new ScopedBindableObject(void 0, self.context);
        context[name] = source[i];
        context.index = i;
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
      child.dispose();
    });
  }
});