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

  this.initialize();
}

module.exports = protoclass(Scope, {
  initialize: function () {
    this.hydrators = [];
    this.node = this.vnode.initialize(this);
    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].initialize();
    }
  },
  child: function () {
    // TODO - child scope for stuff like <repeat>item</repeat>
    // return new Scope(this);
  },
  view: function (context) {

    var clone = this.node.cloneNode();
    var view = new View(clone);

    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].hydrate(view);
    }

    view.bind(context);

    return view;
  }
});