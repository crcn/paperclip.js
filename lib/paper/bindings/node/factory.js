var _      = require("underscore"),
protoclass = require("protoclass");



function Binder (options) {
  this.options = options;
}

protoclass(Binder, {
    init: function () { },
    getBinding: function (templateNode) {
      var cn = templateNode;
      while (cn.parentNode) {
        cn = cn.parentNode;
      }

      var p = this.path();
      for (var i = 0, n = p.length; i < n; i++) {
        cn = cn.childNodes[p[i]];
      }
      var clazz = this.options.clazz;


      return new clazz(_.extend({}, this.options, { node: cn }));
    },
    path: function () {
      if (this._path) return this._path;
      var path = [];
      var cn = this.options.node;
      while (cn.parentNode) {
        var children = [];
        for (var i = 0, n = cn.parentNode.childNodes.length; i < n; i++) {
          children.push(cn.parentNode.childNodes[i]);
        }
        path.unshift(children.indexOf(cn));
        cn = cn.parentNode;
      }
      return this._path = path;
    }
});


function NodeBindingFactory () {
  this.allBindingClasses = {
    node: {},
    attr: {
      "default": []
    }
  };
}

protoclass(NodeBindingFactory, {
  getBinders: function (options) {

    var binders    = [],
    attributes     = options.attributes,
    nodeName       = options.nodeName,
    node           = options.node;

    var bindables = [{
      name: nodeName,
      key: nodeName,
      value: node,
      type: "node",
      node: node
    },{
      name: nodeName,
      key: "default",
      value: node,
      type: "node",
      node: node
    }];

    var context;

    for (var attrName in attributes) {
      bindables.push({
        node: node,
        name: attrName,
        key: attrName,
        value: attributes[attrName],
        type: "attr"
      },{
        node: node,
        name: attrName,
        key: "default",
        value: attributes[attrName],
        type: "attr"
      })
    }

    for (var i = 0, n = bindables.length; i < n; i++) {
      var bindable = bindables[i];
      var bindingClasses = this.allBindingClasses[bindable.type][bindable.key] || [];
      for (var j = 0, n2 = bindingClasses.length; j < n2; j++) {
        var bindingClass = bindingClasses[j];
        if (bindingClass.prototype.test(bindable)) {
          bindable.clazz = bindingClass;
          bindable.application = options.application;
          binders.push(new Binder(bindable));
        }
      }
    }

    return binders;
  },

  register: function (name, bindingClass) {
    var type = bindingClass.type || bindingClass.prototype.type;

    if (!/node|attr/.test(String(type))) {
      throw new Error("node binding class '"+bindingClass.name+"' must have property type 'node', or 'attr'");
    }

    var classes = this.allBindingClasses[type];


    if (!bindingClass.prototype.test) {
      bindingClass.prototype.test = function () {
        return true;
      };
    }

    if (!classes[name]) {
      classes[name] = [];
    }


    classes[name].push(bindingClass);
    return this;
  }
});

var dataBind = require("./attrs/dataBind");

module.exports = function (app) {

  var nodeFactory = new NodeBindingFactory();

  nodeFactory.dataBind = dataBind.factory(app);

  var defaultBindingClasses = {
    "default": [
      require("./attrs/text")
    ],
    "data-bind": [
      dataBind
    ]
  }

  for (var type in defaultBindingClasses) {
    var classes = defaultBindingClasses[type];
    for (var i = 0, n = classes.length; i < n; i++) {
      nodeFactory.register(type, classes[i]);
    }
  }

  return nodeFactory;
}
