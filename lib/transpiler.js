var extend = require("xtend/mutable");
var parser = require("./parser");

/**
 */

function Transpiler() {
  for (var k in this) {
    if (k.charAt(0) === "_") {
      this[k] = this[k].bind(this);
    }
  }
}

/**
 */

extend(Transpiler.prototype, {

  /**
   */

  transpile: function(source) {
    return this._root(parser.parse(source));
  },

  /**
   */

  _root: function(elements) {
    var buffer = "function(fragment, element, text, comment, dynamic) {";

    buffer += "return fragment(" + elements.map(this._expression).join(",") + ")"

    buffer += "}";


    return buffer;
  },

  /**
   */

  _expression: function(expression) {
    return this["_" + expression[0]](expression);
  },

  /**
   */

   _element: function(expression) {
    var buffer = "element('" + expression[1] + "'";

    var dynamicAttributes = [];


    buffer += ", {"

    expression[2].forEach(function(attr) {
      var value = attr[2];
      if (value.length === 1 && value[0][0] === "string") {
        buffer += "'" + attr[1] + "':" + this._expression(value[0]);
      } else {
        dynamicAttributes.push(attr);
      }
    }.bind(this));

    buffer += "}";

    expression[3].forEach(function(child) {
      buffer += "," + this._expression(child);
    }.bind(this));

    var children = expression[3];

    buffer += ")";

    if (dynamicAttributes.length) {
      var oldBuffer = buffer;
      buffer = "dynamic(" + buffer + ", function(ref, context) {";

      dynamicAttributes.forEach(function(attr) {

        // TODO - check prop stuff here
        buffer += "ref.setAttribute('" + attr[1] + "', " + attr[2].map(this._expression).join("+") + ")";
      }.bind(this));

      buffer += "})";
    }



    return buffer;
  },

  /**
   */

  _concat: function(expressions) {

  },


  /**
   */

  _text: function(expression) {
    return "text('" + expression[1] + "')";
  },

  /**
   */

  _comment: function(expression) {
    return "comment('" + expression[1] + "')";
  },

  /**
   */

  _script: function(expression) {
    return this._expression(expression[1]);
  },


  /**
   */

  _reference: function(expression) {
    var buffer = "context." + expression[1].join(".");
    return buffer;
  },

  /**
   */

  _string: function(expression) {
    return "'" + expression[1] + "'";
  }
});

/**
 */

module.exports = new Transpiler();
