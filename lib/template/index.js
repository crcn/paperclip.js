var protoclass = require("protoclass"),
parser         = require("../parser"),
BlockNode      = require("./vnode/block"),
ElementNode    = require("./vnode/element"),
FragmentNode   = require("./vnode/fragment"),
TextNode       = require("./vnode/text"),
CommentNode    = require("./vnode/comment"),
Scope          = require("./scope");

/**
 * Compiles the template 
 */

function Template (script, options) {
  this.script = script;

  // compiles the template node. 
  // TODO - check options to use template node
  this._createScope();
}

module.exports = protoclass(Template, {

  /**
   * Returns a new view instance based on the template.
   */

  view: function (context) {
    return this.scope.view(context);
  },

  /**
   */

  _createScope: function () {
    this.scope = new Scope(this.script(
      FragmentNode.create,
      BlockNode.create,
      ElementNode.create,
      TextNode.create,
      CommentNode.create
    ));
  }
});



module.exports = function (source) {

  var script, tos, options;

  if ((tos = typeof source) === "string") {
    script = parser.compile(source);
  } else if (tos === "function") {
    script = source;
  } else {
    throw new Error("source must either be type 'string' or 'function'");
  }

  // TODO - this part here is a bit problematic since templates can have different
  // modifiers. 

  return script.template || (script.template = new Template(script, options));
}