var protoclass = require("protoclass"),
parser         = require("../parser");

function Template (script) {
  this.script = script;
}

module.exports = protoclass(Template, {

  /**
   */

  modifier: function (modifierOrModifiers, modifier) {
    // if (arguments.length === 1 && modifierOrModifiers)
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