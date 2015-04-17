var BaseComponent  = require("./base");

/**
 * TODO: alloc property
 * TODO: chunk property
 */

function RepeatComponent(options) {
  BaseComponent.call(this, options);
}

/**
 */

function _each(target, iterate) {
  if (Object.prototype.toString.call(target) === "[object Array]") {
    for (var i = 0, n = target.length; i < n; i++) iterate(target[i], i);
  } else {
    for (var key in target) iterate(target[key], key);
  }
}

/**
 */

module.exports = BaseComponent.extend({

  /**
   */

  // TODO - unbind here

  update: function() {

    if (this._updateListener) this._updateListener.dispose();

    var name     = this.attributes.as;
    var key      = this.attributes.key || "index";
    var source   = this.attributes.each;
    var accessor = this.view.accessor;

    if (!source) source = [];

    // note - this should get triggered on rAF
    this._updateListener = accessor.watchEvent(source, "change", function() {
      self.view.runloop.deferOnce(self);
    });

    source = accessor.normalizeCollection(source);

    if (!this._children) this._children = [];
    var self = this;
    var properties;

    var n = 0;

    _each(source, function(model, i) {

      if (name) {
        properties = {};
        properties[key]  = i;
        properties[name] = model;
      } else {
        properties = model;
      }

      if (i < self._children.length) {
        var c = self._children[i];

        // model is different? rebind. Otherwise ignore
        if (c.context === model || c.context[name] !== model) {
          c.bind(properties);
        }
      } else {

        // cannot be this - must be default scope
        var child = self.childTemplate.view(properties, {
          parent: self.view
        });

        self._children.push(child);
        self.section.appendChild(child.render());
      }

      n++;
    });

    // TODO - easeOutSync?
    this._children.splice(n).forEach(function(child) {
      child.dispose();
    });
  }
});
