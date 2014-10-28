var protoclass = require("protoclass"),
Bindings       = require("./bindings"),
createSection  = require("document-section"),
BindableObject = require("bindable-object");

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


  this.section = createSection(template.application.nodeFactory);
  this.section.appendChild(node);
}

protoclass(View, {


  /**
   */

  bind: function (context) {

    if (!context) context = {};

    // TODO - sync changes back to context
    if (!context.__isBindable) {
      context = new BindableObject(context);
    }

    this.context = context;
    this.bindings.bind(context);
    return this;
  },

  /**
   */

  dispose: function () {
    this.remove();
    this.bindings.unbind();
  },

  /**
   */

  render: function () {
    return this.section.render();
  },

  /**
   */

  remove: function () {
    this.section.remove();
    return this;
  },

  /**
   */

  toString: function () {
    return this.render().toString();
  }
});

module.exports = View;