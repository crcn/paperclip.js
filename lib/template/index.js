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
defaultRunner     = require("../defaultRunner");

/**
 * Compiles the template 
 */


function Template (script, options) {


  this.options     = options;
  this.components  = options.components  || {};
  this.modifiers   = options.modifiers   || {};
  this.attributes  = options.attributes  || {};
  this.runner      = options.runner      || defaultRunner;
  this.nodeFactory = options.nodeFactory || nofactor.default;


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
  
  this.component = TemplateComponent.extend({ template: this });

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
      // TODO - this._nodeCreator = this.vnode.initialize(this);
      this.section.appendChild(node);
    } else {
      this.section = new NodeSection(this.nodeFactory, node);
    }

    // console.log(node.)


    // next we need to initialize the hydrators - many of them
    // keep track of the path to a particular nodes.
    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].initialize();
    }
  },

  /**
   * implement me
   */

  child: function (source) {
    // TODO - child scope for stuff like <repeat>item</repeat>
    return new Template(source, this.options);
  },

  /**
   */

  view: function (context) {
    /*

      TODO:
  
    if (internetExplorer) {
      var clone = this.nodeCreator.createNode();
    } else {
      if (!this._templateNode) this._templateNode = this.nodeCreator.createNode();
      var clone = this._templateNode.clone();
    }

     */

    var view = this._viewPool.pop() || new View(this, this._viewPool, this.section.clone(), this.hydrators);
    if (context) view.bind(context);
    return view;
  }
});



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