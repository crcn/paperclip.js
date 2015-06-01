var extend     = require("xtend/mutable");
var transpiler = require("./transpiler");

/**
 */

function Compiler() { }

/**
 */

extend(Compiler.prototype, {

  /**
   */

  compile: function(source, options) {
    var js = transpiler.transpile(source, options);
    return new Function("return " + js)();
  }
});

/**
 */

module.exports = new Compiler();
