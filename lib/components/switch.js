var BaseComponent = require("./base");
var _bind         = require("../utils/bind");

/**
 */

function SwitchComponent(options) {
  BaseComponent.call(this, options);

  var self = this;

  // TODO - this is a bit fugly
  this.childTemplates = this.childTemplate.vnode.children.map(function(vnode) {
    return self.childTemplate.child(vnode);
  });
}

/**
 */

module.exports = BaseComponent.extend(SwitchComponent, {

  /**
   */

  bind: function() {
    BaseComponent.prototype.bind.call(this);

    this.bindings = [];
    var update = _bind(this.update, this);
    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      var when = this.childTemplates[i].vnode.attributes.when;
      if (!when) continue;
      this.bindings.push(when.watch(this.view, this.didChange));
    }
  },

  /**
   */

  unbind: function() {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].dispose();
    }
  },

  /**
   */

  update: function() {

    var child;

    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      child = this.childTemplates[i];
      var when = child.vnode.attributes.when;

      if (!when || when.evaluate(this.view)) {
        break;
      }
    }

    if (this.currentChild == child) {

      if (this._view && this._view.context !== this.context) {
        this._view.bind(this.view.context);
      }

      return;
    }

    if (this._view) {
      this._view.dispose();
    }

    if (i == n) return;

    this.currentChild = child;

    // bypass the show component
    // TODO - not optimial. Do on initialize
    var childChildTemplate = child.child(child.vnode.children, {
      accessor: this.view.accessor
    });

    this._view = childChildTemplate.view(this.view.context);
    this.section.appendChild(this._view.render());
  }
});
