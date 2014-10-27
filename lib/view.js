var protoclass = require("protoclass"),
Bindings       = require("./bindings");

function View (template, node) {

  // the template that created the viw
  this.template = template;

  // the node we're binding to
  this.node     = node;

  // the clips that are specific to the node - generated ONCE
  // from the template
  this.clips    = this.template.clips;

  // the bindings specific to this view. Clips should add bindings here
  // when hydrate is called
  this.bindings = new Bindings(this);

  // hydrates the view with bindings
  this.clips.hydrate(this);
}

protoclass(View, {


  /**
   */

  bind: function (context) {
    this.context = context;
    this.bindings.bind(context);
    return this;
  },

  /**
   */

  render: function () {
    return this.node;
  },

  /**
   */

  remove: function () {
    
  },

  /**
   */

  toString: function () {
    return this.node.toString();
  }
});

module.exports = View;