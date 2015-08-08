var protoclass     = require("protoclass");
var transpiler = require("./transpiler");

/**
 */

function Compiler() { }

/**
 */

protoclass(Compiler, {

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
