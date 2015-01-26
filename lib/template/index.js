var protoclass = require("protoclass"),
parser         = require("../parser"),
BlockNode      = require("./vnode/block"),
ElementNode    = require("./vnode/element"),
FragmentNode   = require("./vnode/fragment"),
TextNode       = require("./vnode/text"),
CommentNode    = require("./vnode/comment"),
Scope          = require("./scope");

function Template (script, options) {
  this.script = script;

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
    return this.scope.view(context);
  },

  /**
   */

  _createVirtualNode: function () {


    // attributes, modifiers, and components need to happen at runtime

    this._vnode = this.script(
      FragmentNode.create,
      BlockNode.create,
      ElementNode.create,
      TextNode.create,
      CommentNode.create
    );

    this.scope = new Scope(this, this._vnode);

    /*

    var scope = this._vnode.initialize({ components: });
    var view = scope.view()


    var scope = this._vnode.initialize({ 
      components: this._components, 
      modifiers: this._modifiers, 
      attributes: this._attributes
    });
  


    

    scope.bindings;
    
    */
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