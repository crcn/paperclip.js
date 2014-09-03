var BindingCollection = require("../collection"),
loaf                  = require("loaf"),
Clip                  = require("../../../clip"),
protoclass            = require("protoclass");


var bindingClasses = {
  "html"   : require("./html"),
  "if"     : require("./conditional"),
  "else"   : require("./conditional"),
  "elseif" : require("./conditional"),
  "value"  : require("./value")
};


function Binder (options) {
  this.options = options;
}

protoclass(Binder, {
  getNode: function () {
    return this.options.clazz.getNode ? this.options.clazz.getNode(this.options) : undefined;
  },
  prepare: function () {
    return this.options.clazz.prepare ? this.options.clazz.prepare(this.options) : undefined;
  },
  init: function () {
    return this._path = this.path();
  },
  getBinding: function (templateNode) {
    var cn = templateNode;

    while (cn.parentNode) {
      cn = cn.parentNode;
    }

    for (var i = 0, n = this._path.length; i < n; i++) {
      cn = cn.childNodes[this._path[i]];
    }


    var clazz = this.options.clazz;


    var ops = {
      node: cn,
      clip: new Clip({
        script: this.options.script,
        watch: false, application:
        this.options.application
      })
    };

    if (this.options.section) {
      ops.section = loaf(this.options.section.nodeFactory, cn, cn.nextSibling);
    }

    for (var key in this.options) {
      if (ops[key] != null) {
        continue;
      }
      ops[key] = this.options[key];
    }

    return new clazz(ops);
  },
  path: function(trace) {
    if (!trace && this._path) return this._path;

    var paths = [], children = [];

    var cn = this.options.node || this.options.section.start;

    while (cn.parentNode) {
      children = [];
      for (var i = 0, n = cn.parentNode.childNodes.length; i < n; i++) {
        children.push(cn.parentNode.childNodes[i]);
      }
      paths.unshift(children.indexOf(cn));
      cn = cn.parentNode;
    }

    return this._path = paths;
  }
});


function Factory () { }

protoclass(Factory, {
  getBinder: function (options) {
    var clipScriptNames = options.script.fn ? ["value"] : Object.keys(options.script),
    bd;

    for (var i = 0, n = clipScriptNames.length; i < n; i++) {
      var scriptName = clipScriptNames[i];
      if (bd = bindingClasses[scriptName]) {
        options.scriptName = scriptName;
        options.clazz = bd;
        if (bd.prepare) bd.prepare(options);
        return new Binder(options);
      }
    }
  },
  register: function (name, bindingClass) {
    bindingClasses[name] = bindingClass;
  }
});

module.exports = function (app) {
  return new Factory();
}
