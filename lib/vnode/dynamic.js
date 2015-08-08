var protoclass    = require("protoclass");
var getNodePath   = require("./_get-node-path");
var getNodeByPath = require("./_get-node-by-path");

/**
 */

function DynamicNode(vnode, bindingClass) {
  this.vnode            = vnode;
  this.bindingClass     = bindingClass;
  this.vnode.parentNode = this;
  this.target           = vnode;
}

protoclass(DynamicNode, {
  freeze: function(options, hydrators) {
    if (options.components[this.vnode.nodeName]) {
      return this.freezeComponent(options, hydrators);
    } else {
      return this.freezeElement(options, hydrators);
    }
  },
  freezeComponent: function(options, hydrators) {
    var h2 = [];
    var element = this.vnode.freeze(options, h2);
    hydrators.push(new ComponentHydrator(h2[0], this.bindingClass, options));
    return element;
  },
  freezeElement: function(options, hydrators) {
    var node = this.vnode.freeze(options, hydrators);
    hydrators.push(new Hydrator(node, this.bindingClass, options));
    return node;
  }
});

/**
 */

function Hydrator(ref, bindingClass, options) {
  this.options      = options;
  this.ref          = ref;
  this.bindingClass = bindingClass;
}

/**
 */

protoclass(Hydrator, {

  /**
   */

  hydrate: function(root, view) {
    if (!this._refPath) this._refPath = getNodePath(this.ref);
    view.bindings.push(new this.bindingClass(getNodeByPath(root, this._refPath), view));
  }
});
/**
 */

function ComponentHydrator(hydrator, bindingClass, options) {
  this.options       = options;
  this.hydrator      = hydrator;
  this.bindingClass  = bindingClass;
}

/**
 */

protoclass(ComponentHydrator, {
  hydrate: function(root, view) {
    this.hydrator.hydrate(root, view);
    var component = view.bindings[view.bindings.length - 1];
    view.bindings.splice(view.bindings.indexOf(component), 0, new this.bindingClass(component, view));
  }
});

/**
 */

module.exports = function(vnode, bindingClass) {
  return new DynamicNode(vnode, bindingClass);
};
