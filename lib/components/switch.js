var BaseComponent  = require("./base"),
BindableCollection = require("bindable-collection"),
BindableObject     = require("bindable-object"),
_bind              = require("../utils/bind");

/**
 */

function SwitchComponent (options) {
  BaseComponent.call(this, options);

  var self = this;

  // TODO - this is a bit fugly
  this.childTemplates = this.childTemplate.vnode.children.map(function (vnode) {
    return self.childTemplate.child(vnode);
  });
}

/**
 */

module.exports = BaseComponent.extend(SwitchComponent, {

  /**
   */

  bind: function (context) {
    BaseComponent.prototype.bind.call(this, context);

    this.bindings = [];
    var update = _bind(this.update, this);
    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      var when = this.childTemplates[i].vnode.attributes.when;
      if (!when) continue;
      this.bindings.push(when.bind(context, update));
    }
  },

  /**
   */

  unbind: function () {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].dispose();
    }
  },

  /**
   */

  update: function () {

    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      var child = this.childTemplates[i];
      var when = child.vnode.attributes.when;

      if (!when || when.evaluate(this.context)) {
        break;
      }
    }

    if (this.currentChild == child) {
      
      if (this._view && this._view.context !== this.context) {
        this._view.bind(this.context);
      }

      return;
    }

    if (this._view) {
      this._view.dispose();
    }

    if (i == n) return;

    this.currentChild = child;

    // bypass the show component
    var childChildTemplate = child.child(child.vnode.children);

    this._view = childChildTemplate.view(this.context);
    this.section.appendChild(this._view.render());
  }
});