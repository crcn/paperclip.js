var protoclass = require("protoclass");
var parser = require("./parser");
var he     = require("he");

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

function _dashToCamelCase(string) {
  return string.split("-").map(function(part, i) {
    var p = part.toLowerCase();
    return i > 0 ? p.charAt(0).toUpperCase() + p.substr(1) : p;
  }).join("");
}
/**
 */

protoclass(Transpiler, {

  /**
   */

  transpile: function(source) {
    return this._root(parser.parse(source));
  },

  /**
   */

  _root: function(elements) {

    var buffer = "(function(fragment, element, text, comment, dynamic, createBindingClass) {";
    var fragment = "fragment([" + this._children(elements) + "])";
    buffer += "'use strict';return " + fragment;
    buffer += "})";

    return buffer;
  },

  /**
   */

  _expression: function(expression) {
    return this["_" + expression[0]](expression);
  },

  /**
   * check for stuff like <li repeat.each={{items}}></li>
   */

  _element: function(expression) {


    var exprs = {};
    var prev  = expression;
    var attrs = [];

    expression[2].forEach(function(attr, i) {

      var key    = attr[1];
      var value  = attr[2];
      var keyParts = key.split(".");

      // check for things like <li repeat.each={{items}}></li>
      if (keyParts.length > 1) {

        if (!exprs[keyParts[0]]) {

          expression = exprs[keyParts[0]] = ["element", keyParts[0], [], [[
            "element",
            expression[1],
            attrs,
            expression[3]
          ]]];
        }

        exprs[keyParts[0]][2].push([attr[0], keyParts[1], value]);
      } else {
        attrs.push(attr);
      }
    });

    return this._element2(expression);
  },

  /**
   */

  _doctype: function(expression) {
    return "text('<!DOCTYPE " + expression[1] + ">')";
  },

  /**
   */

  _children: function(children) {
    var items = [];

    children = children.concat();

    while(children.length) {
        var child = children[children.length - 1];
        if (child[0] !== "text") break;
        child[1] = child[1].replace(/[\s\r\n\t]+$/,"");
        if (/^[\s\r\n\t]*$/.test(child[1])) {
            children.pop();
        } else {
            break;
        }
    }

    return children.map(this._expression).join(", ");
  },

  /**
   */

  _element2: function(expression) {
    var buffer   = "element('" + expression[1] + "'";

    var dynamicAttributes = [];

    buffer += ", {";

    var attrs = [];

    buffer += expression[2].map(function(attr) {

      var key    = attr[1];
      var value  = attr[2];

      if (!value.length || (value.length === 1 && value[0][0] === "string")) {
        return "'" + key + "':" + (value.length ? this._expression(value[0]) : "true");
      } else {
        dynamicAttributes.push(attr);
      }
    }.bind(this)).filter(function(str) {
      return !!str;
    }).join(",");

    buffer += "}";

    var childBuffer = this._children(expression[3])
    if (childBuffer.length) {
      buffer += ", " + childBuffer;
    }

    buffer += ")";

    if (dynamicAttributes.length) {

      var dynamicAttrBuffer = "";
      var staticAttrBuffer  = "";

      dynamicAttributes.forEach(function(expression) {

        var type = expression[0];
        // var key  = _dashToCamelCase(expression[1]);

        dynamicAttrBuffer += "this";
        if (type === "block") {
          dynamicAttrBuffer += ".ref.nodeValue = " + this._expression(expression[1]);
        } else if (type === "attribute") {
          var value = expression[2].map(function(expr) {
            return "("+this._expression(expr)+")";
          }.bind(this)).join("+");
          dynamicAttrBuffer += ".setAttribute('" + expression[1] + "', " + value + ");";
        } else if (type === "property") {
          // dynamicAttrBuffer += ".ref." + expression[1] + "=" + this._expression(expression[2]);
          dynamicAttrBuffer += ".setProperty('" + expression[1] + "', " + this._expression(expression[2]) + ");";
        }
      }.bind(this));

      if (dynamicAttrBuffer.length) {
        dynamicAttrBuffer = "function(context) {" + dynamicAttrBuffer + "}";
      }

      if (staticAttrBuffer.length) {
        staticAttrBuffer = "function() { var self = this; " + staticAttrBuffer + "}";
      }

      if (dynamicAttrBuffer.length || staticAttrBuffer.length) {
        buffer  = "dynamic(" + buffer + ",";
        buffer += "createBindingClass(" + (staticAttrBuffer.length ? staticAttrBuffer : "void 0") + ", " + (dynamicAttrBuffer ? dynamicAttrBuffer : "void 0") + ")";
        buffer += ")";
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
    var buffer = "dynamic(text(), createBindingClass(void 0, function(context) {";
    buffer += "this.ref.nodeValue = " + this._expression(expression[1]) + ";";
    return buffer + "}))";
  },

  /**
   */

  _text: function(expression) {
    return "text('" + he.decode(expression[1]) + "')";
  },

  /**
   */

  _comment: function(expression) {
    return "comment('" + expression[1] + "')";
  },

  /**
   */

  _hash: function(expression) {

    var items = expression[1];

    var buffer = [];

    for (var key in items) {
      buffer.push("'" + key + "':" + this._expression(items[key]));
    }

    return "{" + buffer.join(",") + "}";
  },

  /**
   */

  _script: function(expression) {
    return this._expression(expression[1]);
  },

  /**
   */

  _referenceKeyPath: function(expression) {
    var keypath = [];
    var isDynamic = false;

    expression.forEach(function(part) {
      if (typeof part !== "string") {
        isDynamic = true;
        // console.log(expression);
        keypath.push(this._expression(part));
      } else {
        keypath.push(part);
      }
    }.bind(this));

    keypath = isDynamic ? "[" + keypath.map(function(part, i) {
      return typeof expression[i] === "string" ? "'"+part+"'" : part;
    }).join(",") + "]" : "'" + keypath.join(".") + "'";

    return keypath;
  },

  /**
   */

  _reference: function(expression) {

    var keypath = this._referenceKeyPath(expression[1]);

    if (expression[2]) {

      var gettable = !!~expression[2].indexOf("<~");
      var settable = !!~expression[2].indexOf("~>");

      return "this.view.ref(" + keypath + ", " + gettable + ", " + settable + ")";
    }
    return "this.view.get(" + keypath + ")";
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
    var buffer = "this.view.call(" + this._referenceKeyPath(expression[1][1]) + ", [";
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
