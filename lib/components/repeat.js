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

    var name      = this.attributes.as,
    source        = this.attributes.each,
    accessor      = this.view.accessor;


    if (!source) source = [];

    // note - this should get triggered on rAF
    this._updateListener = accessor.watchEvent(source, "change", function () {
      self.view.runloop.deferOnce(self);
    });

    source = accessor.normalizeCollection(source);


    if (!this._children) this._children = [];
    var self = this;

    for (var i = 0, n = source.length; i < n; i++) {

      var properties, model = source[i];

      if (name) {
        var properties = { index: i };
        properties[name] = model;
      } else {
        properties = model;
      }

      if (i < this._children.length) {
        var c = this._children[i];

        // model is different? rebind. Otherwise ignore
        if (c.context === model || c.context[name] !== model) {
          c.bind(properties);
        }
      } else {

        // cannot be this - must be default scope
        // new ScopedBindableObject(properties, this.scope)
        var child = this.childTemplate.view(properties, { 
          parent: this.view
        });
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