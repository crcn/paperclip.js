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

  bind: function (controller) {
    BaseComponent.prototype.bind.call(this, controller);

    this.bindings = [];
    var update = _bind(this.update, this);
    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      var when = this.childTemplates[i].vnode.attributes.when;
      if (!when) continue;
      this.bindings.push(when.bind(this.view, controller, update));
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

      if (!when || when.evaluate(this.view, this.controller)) {
        break;
      }
    }

    if (this.currentChild == child) {
      
      if (this._view && this._view.controller !== this.controller) {
        this._view.bind(this.controller);
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

    this._view = childChildTemplate.view(this.controller);
    this.section.appendChild(this._view.render());
  }
});