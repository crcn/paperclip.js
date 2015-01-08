var protoclass = require("protoclass"),
parser         = require("../parser");

function Template (script) {
  this.script = script;

  this._modifiers  = {};
  this._components = {};
  this._attributes = {};
}

module.exports = protoclass(Template, {

  /**
   */

  modifier: function (name, modifier) {
    // if (arguments.length === 1 && modifierOrModifiers)
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

  }
});



module.exports = function (source) {

  var script, tos;

  if ((tos = typeof source) === "string") {
    script = parser.compile(source);
  } else if (tos === "function") {
    script = source;
  } else {
    throw new Error("source must either be type 'string' or 'function'");
  }

  return script.template || (script.template = new Template(script));
}