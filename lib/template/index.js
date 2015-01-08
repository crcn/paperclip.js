var protoclass = require("protoclass"),
parser         = require("../parser"),
BlockNode      = require("./vnode/block"),
ElementNode    = require("./vnode/element"),
FragmentNode   = require("./vnode/fragment"),
TextNode       = require("./vnode/text"),
CommentNode    = require("./vnode/comment");

function Template (script, options) {
  this.script = script;

  this._modifiers  = {};
  this._components = {};
  this._attributes = {};

  // compiles the template node. 
  // TODO - check options to use template node
  this._createVirtualNode();
}

module.exports = protoclass(Template, {

  /**
   */

  modifier: function (name, modifier) { 

  },

  /**
   */

  component: function (name, componentClass) {

  },

  /**
   */

  attribute: function (name, attributeClass) {

  },

  /**
   * returns a new view for the template
   */

  view: function (context) {

  },

  /**
   */

  _createVirtualNode: function () {
    this._vnode = this.script(
      FragmentNode.create.bind(this, this),
      BlockNode.create.bind(this, this),
      ElementNode.create.bind(this, this),
      TextNode.create.bind(this, this),
      CommentNode.create.bind(this, this)
    );
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


  return script.template || (script.template = new Template(script, options));
}