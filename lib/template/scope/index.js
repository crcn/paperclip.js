var protoclass = require("protoclass"),
nofactor       = require("nofactor"),
View           = require("./view");

function Scope (template, vnode, parent) {

  this.parent      = parent;
  this.template    = template;
  this.vnode       = vnode;
  this.nodeFactory = nofactor.default;
  this.components  = parent ? parent.components || {} : {};
  this.modifiers   = parent ?parent.modifiers  || {}  : {};

  // added by the vnode
  this.hydrators   = [];

  this.node = this.vnode.initialize(this);

  // disposed nodes
  this._nodePool = [];
}

module.exports = protoclass(Scope, {
  child: function () {
    // TODO - child scope for stuff like <repeat>item</repeat>
    // return new Scope(this);
  },
  view: function (context) {
    var clone = this.node.cloneNode();
    var view = new View(clone, context);
    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].hydrate(clone);
    }
    return view;
  }
});