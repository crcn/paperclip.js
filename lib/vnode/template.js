var View              = require("./view");
var protoclass        = require("protoclass");
var extend            = require("xtend/mutable");
var FragmentSection   = require("./_fragment-section");
var NodeSection       = require("./_node-section");
var templateComponent = require("./template-component");

function _cleanupComponents(hash) {
  var c1 = hash || {};
  var c2 = {};

  for (var k in c1) {
    if (c1[k].__isTemplate) c1[k]  =  templateComponent(c1[k]);
    c2[k.toLowerCase()] = c1[k];
  }

  return c2;
}

/**
 */

function _cleanupOptions(options) {
  return extend({}, options, {
    components: _cleanupComponents(options.components),
    attributes: options.attributes
  });
}

/**
 */

function Template(vnode, options) {

  this.vnode = vnode;

  // hydrates nodes when the template is used
  this._hydrators = [];

  options = _cleanupOptions(options);

  this.viewClass = options.viewClass || View;
  this.options   = options;
  this.modifiers = options.modifiers || {};

  // freeze & create the template node immediately
  var node = vnode.freeze(options, this._hydrators);

  if (node.nodeType === 11) {
    this.section = new FragmentSection(options.document);
    this.section.appendChild(node);
  } else {
    this.section = new NodeSection(options.document, node);
  }
}

protoclass(Template, {
  __isTemplate: true,
  view: function(context, options) {

    // TODO - make compatible with IE 8
    var section     = this.section.clone();

    var view = new this.viewClass(section, this, context, options);

    for (var i = 0, n = this._hydrators.length; i < n; i++) {
      this._hydrators[i].hydrate(section.node || section.start.parentNode, view);
    }

    // TODO - set section instead of node
    return view;
  }
});
/**
 */

module.exports = function(vnode, options) {
  return new Template(vnode, options);
};
