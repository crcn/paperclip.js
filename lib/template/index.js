var protoclass        = require("protoclass"),
nofactor              = require("nofactor"),
parser                = require("../parser"),
BlockNode             = require("./vnode/block"),
ElementNode           = require("./vnode/element"),
FragmentNode          = require("./vnode/fragment"),
TextNode              = require("./vnode/text"),
CommentNode           = require("./vnode/comment"),
View                  = require("./view"),
createDocumentSection = require("document-section"),
TemplateComponent     = require("./component");

/**
 * Compiles the template 
 */

function Template (script, options) {

  if (typeof script === "function") {
    this.vnode = script(
      FragmentNode.create,
      BlockNode.create,
      ElementNode.create,
      TextNode.create,
      CommentNode.create
    )
  } else {
    this.vnode = script;
  }

  this.options = options || {};

  this.options     = options;
  this.components  = options.components || {};
  this.modifiers   = options.modifiers  || {};
  this.attributes  = options.attributes  || {};

  this.nodeFactory = nofactor.default;

  this.initialize();
}

module.exports = protoclass(Template, {

  /**
   */

  initialize: function () {
    this.hydrators = [];

    // first build the cloneable DOM node
    this.section = createDocumentSection();
    this.section.appendChild(this.vnode.initialize(this));

    // next we need to initialize the hydrators - many of them
    // keep track of the path to a particular nodes.
    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].initialize();
    }
  },

  /**
   * casts the template as a registerable component
   */

  component: function () {
    return this._component || (this._component = TemplateComponent.extend({ template: this }));
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
    var view = new View(this, this.section.clone(), this.hydrators);
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

  return new Template(script, options || {});
}