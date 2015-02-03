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

  // TODO - unbind here

  update: function () {
    if (this._updateListener) this._updateListener.dispose();

    var name = this.attributes.as,
    source   = this.attributes.each;

    if (!name) throw new Error("'as' must exist for repeat block");

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

      var properties = { index: i };
      properties[name] = source[i];

      if (i < this._children.length) {
        var c = this._children[i];
        c.scope.setProperties(properties);
      } else {

        // cannot be this - must be default scope
        // new ScopedBindableObject(properties, this.scope)
        var child = this.childTemplate.view(new this.childTemplate.defaultScopeClass(properties, this.scope));
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