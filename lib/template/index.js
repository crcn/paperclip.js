var protoclass        = require("protoclass");
var nofactor          = require("nofactor");
var BlockNode         = require("./vnode/block");
var ElementNode       = require("./vnode/element");
var FragmentNode      = require("./vnode/fragment");
var TextNode          = require("./vnode/text");
var CommentNode       = require("./vnode/comment");
var View              = require("./view");
var FragmentSection   = require("../section/fragment");
var NodeSection       = require("../section/node");
var TemplateComponent = require("./component");
var defaults          = require("../defaults");
var extend            = require("../utils/extend");

/**
 * Compiles the template
 */

var isIE = false;

// check for all versions of IE - IE doesn't properly support
// element.cloneNode(true), so we can't use that optimization.
/* istanbul ignore if */
if (process.browser) {
  var hasMSIE    = ~navigator.userAgent.toLowerCase().indexOf("msie");
  var hasTrident = ~navigator.userAgent.toLowerCase().indexOf("trident");
  isIE = !!(hasMSIE || hasTrident);
}

function Template(script, options) {

  this.options         = options;
  this.accessor        = options.accessor;
  this.useCloneNode    = options.useCloneNode != void 0 ? !!options.useCloneNode : !isIE;
  this.accessorClass   = options.accessorClass || defaults.accessorClass;
  this.components      = options.components    || defaults.components;
  this.modifiers       = options.modifiers     || defaults.modifiers;
  this.attributes      = options.attributes    || defaults.attributes;
  this.runloop         = options.runloop       || defaults.runloop;
  this.nodeFactory     = options.nodeFactory   || nofactor;

  if (typeof script === "function") {
    this.vnode = script(
      FragmentNode.create,
      BlockNode.create,
      ElementNode.create,
      TextNode.create,
      CommentNode.create,
      void 0,
      this.modifiers
    );
  } else {
    this.vnode = script;
  }

  this._viewPool   = [];

  this.initialize();
}

/**
 */

module.exports = protoclass(Template, {

  /**
   */

  initialize: function() {
    this.hydrators = [];

    // first build the cloneable DOM node
    this.section = new FragmentSection(this.nodeFactory);

    var node = this.vnode.initialize(this);

    if (node.nodeType === 11) {
      this.section = new FragmentSection(this.nodeFactory);
      this.section.appendChild(node);
    } else {
      this.section = new NodeSection(this.nodeFactory, node);
    }

    // next we need to initialize the hydrators - many of them
    // keep track of the path to a particular nodes.
    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].initialize();
    }
  },

  /**
   */

  createComponentClass: function(contextClass) {
    return TemplateComponent.extend({
      template     : this,
      contextClass : contextClass || Object
    });
  },

  /**
   * Creates a child template with the same options, difference source.
   * This method allows child nodes to have a different context, or the same
   * context of a different template. Used in components.
   */

  child: function(vnode, options) {
    return new Template(vnode, extend(options, {}, this.options));
  },

  /**
   * Creates a new or recycled view which binds a cloned node
   * from the template to a context (or view scope).
   */

  view: function(context, options) {

    var clonedSection;

    /*
      TODO (for IE):

      if (internetExplorer) {
        var clone = this.nodeCreator.createNode();
      } else {
        if (!this._templateNode) this._templateNode = this.nodeCreator.createNode();
        var clone = this._templateNode.clone();
      }
     */

    // re-init for now
    if (!this.useCloneNode) {
      this.initialize();
      clonedSection = this.section;
    } else {
      clonedSection = this.section.clone();
    }

    var view = this._viewPool.pop();

    if (view) {
      view.setOptions(options || {});
    } else {
      view = new View(this, this._viewPool, clonedSection, this.hydrators, options || {});
    }

    view.setOptions(options || {});
    if (context) view.bind(context);
    return view;
  }
});

/**
 */

module.exports = function(source, options) {

  var script;
  var tos = typeof source;

  if (tos === "string") {

    if (!module.exports.parser) {
      throw new Error("paperclip parser does not exist");
    }

    script = module.exports.parser.compile(source);
  } else if (tos === "function") {
    script = source;
  } else {
    throw new Error("source must either be type 'string' or 'function'");
  }

  /**
   * Note: the template used to be cached on the script, but this isn't
   * possible now since components are registered on the template level.
   */

  return new Template(script, options || defaults);
};
