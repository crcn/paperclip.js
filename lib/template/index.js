var protoclass    = require("protoclass"),
nofactor          = require("nofactor"),
parser            = require("../parser"),
BlockNode         = require("./vnode/block"),
ElementNode       = require("./vnode/element"),
FragmentNode      = require("./vnode/fragment"),
TextNode          = require("./vnode/text"),
CommentNode       = require("./vnode/comment"),
View              = require("./view"),
FragmentSection   = require("../section/fragment"),
NodeSection       = require("../section/node"),
TemplateComponent = require("./component"),
defaults          = require("../defaults"),
defaultRunner     = require("../defaultRunner"),
defaultAccessor   = require("../defaultAccessor"),
BindableObject    = require("bindable-object");

/**
 * Compiles the template 
 */

var isIE = false;

// check for all versions of IE - IE doesn't properly support 
// element.cloneNode(true), so we can't use that optimization.
if (process.browser) {
  isIE = !!(~navigator.userAgent.toLowerCase().indexOf("msie") || ~navigator.userAgent.toLowerCase().indexOf("trident"))
}

function Template (script, options) {


  this.options      = options;
  this.accessor     = options.accessor    || defaultAccessor;
  this.components   = options.components  || {};
  this.modifiers    = options.modifiers   || {};
  this.attributes   = options.attributes  || {};
  this.runner       = options.runner      || defaultRunner;
  this.useCloneNode = !isIE;
  this.nodeFactory  = options.nodeFactory || nofactor.default;


  if (typeof script === "function") {
    this.vnode = script(
      FragmentNode.create,
      BlockNode.create,
      ElementNode.create,
      TextNode.create,
      CommentNode.create,
      void 0,
      this.modifiers
    )
  } else {
    this.vnode = script;
  }

  this._viewPool   = [];

  this.initialize();
}

module.exports = protoclass(Template, {

  /**
   */

  initialize: function () {
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

  createComponentClass: function (controllerClass) {
    return TemplateComponent.extend({
      template        : this,
      controllerClass : controllerClass || BindableObject
    });
  },

  /**
   * Creates a child template with the same options, difference source.
   * This method allows child nodes to have a different context, or the same
   * context of a different template. Used in components.
   */

  child: function (vnode) {
    return new Template(vnode, this.options);
  },

  /**
   * Creates a new or recycled view which binds a cloned node
   * from the template to a context (or view controller). 
   */

  view: function (properties) {

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


    var view = this._viewPool.pop() || new View(this, this._viewPool, clonedSection, this.hydrators);
    if (properties) view.bind(properties);
    return view;
  }
});

/**
 */

module.exports = function (source, options) {

  var script, tos = typeof source, options;

  if (tos === "string") {
    script = parser.compile(source);
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
}