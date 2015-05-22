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

    var buffer = "function(fragment, element, text, comment, dynamic, root, reference) {";
    var fragment = "fragment(" + elements.map(this._expression).join(",") + ")";
    buffer += "return " + fragment;
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

    buffer += ", {";

    var attrs = [];

    buffer += expression[2].map(function(attr) {
      var value = attr[2];
      if (value.length === 1 && value[0][0] === "string") {
        return "'" + attr[1] + "':" + this._expression(value[0]);
      } else {
        dynamicAttributes.push(attr);
      }
    }.bind(this)).filter(function(str) {
      return !!str;
    }).join(",");

    buffer += "}";

    expression[3].forEach(function(child) {
      buffer += "," + this._expression(child);
    }.bind(this));

    var children = expression[3];

    buffer += ")";

    if (dynamicAttributes.length) {

      buffer = "dynamic(" + buffer + ", function(ref, context) {";

      dynamicAttributes.forEach(function(ref) {

        var type = ref[0];

        buffer += "ref";

        if (type === "block") {
          buffer += ".nodeValue = " + this._expression(ref[1]) + ";";
        } else if (type === "attribute") {
          buffer += ".setAttribute('" + ref[1] + "', " + ref[2].map(this._expression).join("+") + ");";
        } else if (type === "property") {
          buffer += "." + ref[1] + "=" + this._expression(ref[2]);
        }
      }.bind(this));

      buffer += "})";
    }

    return buffer;
  },

  /**
   */

  __addReference: function(expression) {
    var name = "_" + (++this._refCounter);
    this._refs[name] = expression;
    return name;
  },

  /**
   */

  _block: function(expression) {
    var buffer = "dynamic(text(), function(ref, context) {";
    buffer += "ref.nodeValue = " + this._expression(expression[1]) + ";";
    return buffer + "})";
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
  },

  /**
   */

  _operator: function(expression) {
    return this._expression(expression[2]) + expression[1] + this._expression(expression[3]);
  },

  /**
   */

  _condition: function(expression) {
    return this._expression(expression[1])  +
    "?" + this._expression(expression[2]) +
    ":" + this._expression(expression[3]);
  },

  /**
   */

  _literal: function(expression) {
    return expression[1];
  },

  /**
   */

  _not: function(expression) {
    return "!" + this._expression(expression[1]);
  },

  /**
   */

  _negative: function(expression) {
    return "-" + this._expression(expression[1]);
  },

  /**
   */

  _call: function(expression) {
    var buffer = this._expression(expression[1]) + "(";
    buffer += expression[2].map(this._expression).join(",");
    return buffer + ")";
  },

  /**
   */

  _modifier: function(expression) {
    return "this.options.modifiers." + expression[1] + "(" + expression[2].map(this._expression).join(",") + ")";
  },

  /**
   */

  _group: function(expression) {
    return "(" + this._expression(expression[1]) + ")";
  }
});

/**
 */

module.exports = new Transpiler();
