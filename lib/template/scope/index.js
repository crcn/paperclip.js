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

    // first build the cloneable DOM node
    this.node = this.vnode.initialize(this);

    // next we need to initialize the hydrators - many of them
    // keep track of the path to a particular nodes.
    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].initialize();
    }
  },
  child: function () {
    // TODO - child scope for stuff like <repeat>item</repeat>
    // return new Scope(this);
  },
  view: function (context) {
    var view = new View(this.node.cloneNode(), this.hydrators);
    view.bind(context);
    return view;
  }
});