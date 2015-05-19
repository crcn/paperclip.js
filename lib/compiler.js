var extend     = require("xtend/mutable");
var transpiler = require("./transpiler");

/**
 */

function Compiler() {

}

/**
 */

extend(Compiler.prototype, {

  /**
   */

  compile: function(source) {
    var js = transpiler.transpile(source);
    return new Function("return " + js)();
  }
});

/**
 */

module.exports = new Compiler();
