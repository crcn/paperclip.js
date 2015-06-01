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
  this.transpile = this.transpile.bind(this);
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

    var buffer = "function(fragment, element, text, comment, dynamic, createBindingClass) {";
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

      var dynamicAttrBuffer = "";
      var staticAttrBuffer  = "";

      dynamicAttributes.forEach(function(expression) {

        var type = expression[0];

        if (type === "property" && /^on\w+$/.test(expression[1])) {
          var event = expression[1].replace(/^on/,"").toLowerCase();


          var handlerBuffer = "";
          handlerBuffer     += "var view = self.view;";
          handlerBuffer     += "view.context.event = event;";
          handlerBuffer += this._expression(expression[2]);
          staticAttrBuffer += "this.ref.addEventListener('" + event + "', function(event) { " + handlerBuffer + "})";
        } else {
          dynamicAttrBuffer += "this.ref";
          if (type === "block") {
            dynamicAttrBuffer += ".nodeValue = " + this._expression(expression[1]);
          } else if (type === "attribute") {
            dynamicAttrBuffer += ".setAttribute('" + expression[1] + "', " + expression[2].map(this._expression).join("+") + ");";
          } else if (type === "property") {
            dynamicAttrBuffer += "." + expression[1] + "=" + this._expression(expression[2]);
          }
        }
      }.bind(this));

      if (dynamicAttrBuffer.length) {
        dynamicAttrBuffer = "function(view) {" + dynamicAttrBuffer + "}";
      }


      if (staticAttrBuffer.length) {
        staticAttrBuffer = "function() { var self = this; " + staticAttrBuffer + "}";
      }


      if (dynamicAttrBuffer.length || staticAttrBuffer.length) {


        buffer  = "dynamic(" + buffer + ",";
        buffer += "createBindingClass(" + (staticAttrBuffer.length ? staticAttrBuffer : "void 0") + ", " + (dynamicAttrBuffer ? dynamicAttrBuffer : "void 0") + ")";
        buffer += ")"
      }

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

    // TODO - check for unbound expressions here
    var buffer = "dynamic(text(), createBindingClass(void 0, function(view) {";
    buffer += "this.ref.nodeValue = " + this._expression(expression[1]) + ";";
    return buffer + "}))";
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
    return "view.get('" + expression[1].join(".") + "')";
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
    var buffer = "view.call('" + expression[1][1].join(".") + "', [";
    buffer += expression[2].map(this._expression).join(",");
    return buffer + "])";
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
  },

  /**
   */

  __findExpressions: function(type, expr) {
    var exprs = [];

    this.__traverse(expr, function(expr) {
      if (expr[0] === type) exprs.push(expr);
    });

    return exprs;
  },

  /**
   */

  __traverse: function(expr, iterator) {
    iterator(expr);
    expr.forEach(function(v) {
      if (v && typeof v === "object") {
        this.__traverse(v, iterator);
      }
    }.bind(this));

  }
});

/**
 */

module.exports = new Transpiler();
