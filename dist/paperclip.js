(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var nofactor = require("nofactor");
var defaults = require("./defaults");
var template = require("./template");
var parser   = require("./parser");

template.parser = parser;

var paperclip = module.exports = {

  /**
   */

  accessors: defaults.accessors,

  /**
   */

  runloop: defaults.runloop,

  /**
   */

  document: nofactor,

  /**
   * web component base class
   */

  Component : require("./components/base"),

  /**
   */

  Attribute : require("./attributes/script"),

  /**
   * template factory
   */

  template  : template,

  /**
   */

  components : defaults.components,

  /**
   */

  attributes : defaults.attributes,

  /**
   */

  modifiers: defaults.modifiers,

  /**
   */

  parse: parser.parse
};

/* istanbul ignore next */
if (typeof window !== "undefined") {

  window.paperclip = paperclip;

  // no conflict mode. Release paperclip from global scope.
  window.paperclip.noConflict = function() {
    delete window.paperclip;
    return paperclip;
  };
}

},{"./attributes/script":16,"./components/base":19,"./defaults":25,"./parser":47,"./template":54,"nofactor":79}],2:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 */

function BaseAccessor() {
}

/**
 */

module.exports = protoclass(BaseAccessor, {
  __isScope: true

  /*accessible: function(context) {
    // override me
  },
  castObject: function(context) {
    // override me
  },
  castCollection: function(context) {
    // override me
  },
  normalizeObject: function(context) {
    // override me
  },
  normalizeCollection: function(context) {
    // override me
  },
  get: function(context, path) {
    // override me
  },
  set: function(context, path, value) {
    // override me
  },
  call: function(context, ctxPath, fnPath, params) {
    // override me
  },
  watchProperty: function(context, path, listener) {
    // override me
  },
  watchEvent: function(context, operation, listener) {
    // override me
  },
  dispose: function() {

  }*/
});

},{"protoclass":80}],3:[function(require,module,exports){
var BaseAccessor = require("./base");
var _set         = require("../utils/set");

function POJOAccessor() {
  BaseAccessor.call(this);
  this._getters  = {};
  this._callers  = {};
  this._watchers = [];
}

module.exports = BaseAccessor.extend(POJOAccessor, {

  /**
   */

  castObject: function(object) { return object; },

  /**
   */

  call: function(object, path, params) {

    var caller;

    if (!(caller = this._callers[path])) {
      var ctxPath = ["this"].concat(path.split("."));
      ctxPath.pop();
      ctxPath = ctxPath.join(".");
      caller = this._callers[path] = new Function("params", "return this." + path + ".apply(" + ctxPath + ", params);");
    }

    try {
      var ret = caller.call(object, params);
      this.applyChanges();
      return ret;
    } catch (e) {
      return void 0;
    }
  },

  /**
   */

  get: function(object, path) {

    var pt = typeof path !== "string" ? path.join(".") : path;
    var getter;

    if (!(getter = this._getters[pt])) {
      getter = this._getters[pt] = new Function("return this." + pt);
    }

    // is undefined - fugly, but works for this test.
    try {
      return getter.call(object);
    } catch (e) {
      return void 0;
    }
  },

  /**
   */

  set: function(object, path, value) {

    if (typeof path === "string") path = path.split(".");

    var ret = _set(object, path, value);

    this.applyChanges();

    return ret;
  },

  /**
   */

  watchProperty: function(object, path, listener) {

    var self = this;
    var currentValue;
    var firstCall = true;

    return this._addWatcher(function() {
      var newValue = self.get(object, path);
      if (!firstCall && newValue === currentValue && typeof newValue !== "function") return;
      firstCall = false;
      var oldValue = currentValue;
      currentValue = newValue;
      listener(newValue, currentValue);
    });
  },

  /**
   */

  _addWatcher: function(applyChanges) {

    var self = this;

    var watcher = {
      apply: applyChanges,
      trigger: applyChanges,
      dispose: function() {
        var i = self._watchers.indexOf(watcher);
        if (~i) self._watchers.splice(i, 1);
      }
    };

    this._watchers.push(watcher);

    return watcher;
  },

  /**
   */

  watchEvent: function(object, event, listener) {

    if (Object.prototype.toString.call(object) === "[object Array]" && event === "change") {
      return this._watchArrayChangeEvent(object, listener);
    }

    return {
      dispose: function() { }
    };
  },

  /**
   */

  _watchArrayChangeEvent: function(object, listener) {

    var copy = object.concat();

    return this._addWatcher(function() {

      var hasChanged = object.length !== copy.length;

      if (!hasChanged) {
        for (var i = 0, n = copy.length; i < n; i++) {
          hasChanged = (copy[i] !== object[i]);
          if (hasChanged) break;
        }
      }

      if (hasChanged) {
        copy = object.concat();
        listener();
      }
    });
  },

  /**
   */

  normalizeCollection: function(collection) {
    return collection;
  },

  /**
   */

  normalizeObject: function(object) {
    return object;
  },

  /**
   * DEPRECATED
   */

  apply: function() {
    this.applyChanges();
  },

  /**
   */

  applyChanges: function() {
    // if (this.__applyingChanges) return;
    // this.__applyingChanges = true;
    for (var i = 0, n = this._watchers.length; i < n; i++) {
      this._watchers[i].apply();
    }
    // this.__applyingChanges = false;
  }
});

},{"../utils/set":74,"./base":2}],4:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 * attribute binding
 */

function Attribute(options) {

  this.view     = options.view;
  this.node     = options.node;
  this.section  = options.section;
  this.key      = options.key;
  this.value    = options.value;
  this.document = this.view.template.document;

  // initialize the DOM elements
  this.initialize();
}

/**
 */

module.exports = protoclass(Attribute, {

  /**
   */

  initialize: function() {
  },

  /**
   */

  bind: function() {
  },

  /**
   */

  unbind: function() {
  }
});

},{"protoclass":80}],5:[function(require,module,exports){
var ScriptAttribute = require("./script");

/**
 */

module.exports = ScriptAttribute.extend({

  /**
   */

  update: function() {

    var classes = this.currentValue;

    if (typeof classes === "string") {
      return this.node.setAttribute("class", classes);
    }

    if (!classes) {
      return this.node.removeAttribute("class");
    }

    var classesToUse = this.node.getAttribute("class");
    classesToUse     = classesToUse ? classesToUse.split(" ") : [];

    for (var classNames in classes) {

      var useClass = classes[classNames];
      var classNamesArray = classNames.split(/[,\s]+/g);

      for (var i = 0, n = classNamesArray.length; i < n; i++) {
        var className = classNamesArray[i];

        var j = classesToUse.indexOf(className);
        if (useClass) {
          if (!~j) {
            classesToUse.push(className);
          }
        } else if (~j) {
          classesToUse.splice(j, 1);
        }
      }
    }

    this.node.setAttribute("class", classesToUse.join(" "));
  }
});

module.exports.test = function(value) {
  return typeof value === "object" && !value.buffered;
};

},{"./script":16}],6:[function(require,module,exports){
var protoclass = require("protoclass");
var _bind = require("../utils/bind");
var Base = require("./base");

/**
 */

function DefaultEventAttribute(options) {
  this._onEvent = _bind(this._onEvent, this);
  Base.call(this, options);
}

/**
 */

Base.extend(DefaultEventAttribute, {

  /**
   */

  initialize: function() {
    // convert onEvent to event
    var event = this.event || (this.event = this.key.toLowerCase().replace(/^on/, ""));
    this.node.addEventListener(event, this._onEvent);
  },

  /**
   */

  bind: function() {
    Base.prototype.bind.call(this);
    this.bound = true;
  },

  /**
   */

  _onEvent: function(event) {
    if (!this.bound) return;
    this.view.set("event", event);
    this.value.evaluate(this.view);
  },

  /**
   */

  unbind: function() {
    this.bound = false;
  }
});

module.exports = DefaultEventAttribute;

},{"../utils/bind":71,"./base":4,"protoclass":80}],7:[function(require,module,exports){
var KeyCodedEventAttribute = require("./keyCodedEvent");

/**
 */

module.exports = KeyCodedEventAttribute.extend({
  keyCodes: [8]
});

},{"./keyCodedEvent":15}],8:[function(require,module,exports){
var BaseAttribue = require("./base");

/**
 */

module.exports = BaseAttribue.extend({
  initialize: function() {
    this.view.transitions.push(this);
  },
  enter: function() {
    var v = this.value;
    v = v.evaluate(this.view);
    v(this.node, function() { });
  }
});

},{"./base":4}],9:[function(require,module,exports){
var BaseAttribue = require("./base");

/**
 */

module.exports = BaseAttribue.extend({
  initialize: function() {
    this.view.transitions.push(this);
  },
  exit: function(complete) {
    var v = this.value;
    v = v.evaluate(this.view);
    v(this.node, complete);
  }
});

},{"./base":4}],10:[function(require,module,exports){
var ScriptAttribute = require("./script");

/**
 */

module.exports = ScriptAttribute.extend({
  update: function() {
    if (this.currentValue) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  }
});

},{"./script":16}],11:[function(require,module,exports){
var KeyCodedEventAttribute = require("./keyCodedEvent");

/**
 */

module.exports = KeyCodedEventAttribute.extend({
  keyCodes: [13]
});

},{"./keyCodedEvent":15}],12:[function(require,module,exports){
var KeyCodedEventAttribute = require("./keyCodedEvent");

/**
 */

module.exports = KeyCodedEventAttribute.extend({
  keyCodes: [27]
});

},{"./keyCodedEvent":15}],13:[function(require,module,exports){
var DefaultEventDataBinding = require("./defaultEvent");

/**
 */

module.exports = DefaultEventDataBinding.extend({

  /**
   */

  _onEvent: function(event) {
    event.preventDefault();
    DefaultEventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./defaultEvent":6}],14:[function(require,module,exports){
(function (process){
var ScriptAttribute = require("./script");

/**
 */

module.exports = ScriptAttribute.extend({

  /**
   */

  update: function() {
    if (!this.currentValue) return;
    if (this.node.focus) {
      var self = this;

      if (!process.browser) return this.node.focus();

      // focus after being on screen. Need to break out
      // of animation, so setTimeout is the best option
      setTimeout(function() {
        self.node.focus();
      }, 1);
    }
  }
});

}).call(this,require('_process'))
},{"./script":16,"_process":77}],15:[function(require,module,exports){
var EventDataBinding = require("./event");

/**
 */

module.exports = EventDataBinding.extend({

  /**
   */

  event: "keydown",

  /**
   */

  keyCodes: [],

  /**
   */

  _onEvent: function(event) {

    if (!~this.keyCodes.indexOf(event.keyCode)) {
      return;
    }

    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./event":13}],16:[function(require,module,exports){
var BaseAttribute = require("./base");

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  bind: function() {
    BaseAttribute.prototype.bind.call(this);
    var self = this;

    if (this.value.watch) {
      this._binding = this.value.watch(this.view, function(nv) {
        if (nv === self.currentValue) return;
        self.currentValue = nv;
        self.view.runloop.deferOnce(self);
      });

      this.currentValue = this.value.evaluate(this.view);
    }

    if (this.currentValue != null) this.update();
  },

  /**
   */

  update: function() {

  },

  /**
   */

  unbind: function() {
    if (this._binding) this._binding.dispose();
  }
});

},{"./base":4}],17:[function(require,module,exports){
var ScriptAttribute = require("./script");

/**
 */

module.exports = ScriptAttribute.extend({

  /**
   */

  bind: function() {
    this._currentStyles = {};
    ScriptAttribute.prototype.bind.call(this);
  },

  /**
   */

  update: function() {

    var styles = this.currentValue;

    var newStyles = {};

    for (var name in styles) {
      var style = styles[name];
      if (style !== this._currentStyles[name]) {
        newStyles[name] = this._currentStyles[name] = style || "";
      }
    }

    if (this.node.__isNode) {
      this.node.style.setProperties(newStyles);
    } else {
      for (var key in newStyles) {
        this.node.style[key] = newStyles[key];
      }
    }
  }
});

/**
 */

module.exports.test = function(value) {
  return typeof value === "object" && !value.buffered;
};

},{"./script":16}],18:[function(require,module,exports){
(function (process){
var BaseAttribute = require("./script");
var _bind         = require("../utils/bind");

/**
 */

function ValueAttribute(options) {
  this._onInput = _bind(this._onInput, this);
  BaseAttribute.call(this, options);
}

/**
 */

BaseAttribute.extend(ValueAttribute, {

  /**
   */

  _events: ["change", "keyup", "input"],

  /**
   */

  initialize: function() {
    var self = this;
    this._events.forEach(function(event) {
      self.node.addEventListener(event, self._onInput);
    });
  },

  /**
   */

  bind: function() {
    BaseAttribute.prototype.bind.call(this);

    var self = this;

    // TODO - move this to another attribute helper (more optimal)
    if (/^(text|password|email)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function() {
        self._onInput();
      }, process.browser ? 500 : 10);
    }
  },

  /**
   */

  unbind: function() {
    BaseAttribute.prototype.unbind.call(this);
    clearInterval(this._autocompleteCheckInterval);

    var self = this;
  },

  /**
   */

  update: function() {

    var model = this.model = this.currentValue;

    if (this._modelBindings) this._modelBindings.dispose();

    if (!model || !model.__isReference) {
      throw new Error("input value must be a reference. Make sure you have <~> defined");
    }

    var self = this;

    if (model.gettable) {
      this._modelBindings = this.view.watch(model.path, function(value) {
        self._elementValue(self._parseValue(value));
      });

      this._modelBindings.trigger();
    }
  },

  _parseValue: function(value) {
    if (value == null || value === "") return void 0;
    return value;
  },

  /**
   */

  _onInput: function(event) {

    clearInterval(this._autocompleteCheckInterval);

    // ignore some keys
    if (event && (!event.keyCode || !~[27].indexOf(event.keyCode))) {
      event.stopPropagation();
    }

    var value = this._parseValue(this._elementValue());

    if (!this.model) return;

    if (String(this.model.value()) == String(value))  return;

    this.model.value(value);
  },

  /**
   */

  _elementValue: function(value) {

    var isCheckbox        = /checkbox/.test(this.node.type);
    var isRadio           = /radio/.test(this.node.type);
    var isRadioOrCheckbox = isCheckbox || isRadio;
    var hasValue          = Object.prototype.hasOwnProperty.call(this.node, "value");
    var isInput           = hasValue || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());

    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean(this.node.checked);
      } else if (isInput) {
        return this.node.value || "";
      } else {
        return this.node.innerHTML || "";
      }
    }

    if (value == null) {
      value = "";
    } else {
      clearInterval(this._autocompleteCheckInterval);
    }

    if (isRadioOrCheckbox) {
      if (isRadio) {
        if (String(value) === String(this.node.value)) {
          this.node.checked = true;
        }
      } else {
        this.node.checked = value;
      }
    } else if (String(value) !== this._elementValue()) {

      if (isInput) {
        this.node.value = value;
      } else {
        this.node.innerHTML = value;
      }
    }
  }
});

/**
 */

ValueAttribute.test = function(value) {
  return typeof value === "object" && !value.buffered;
};

/**
 */

module.exports = ValueAttribute;

}).call(this,require('_process'))
},{"../utils/bind":71,"./script":16,"_process":77}],19:[function(require,module,exports){
var protoclass = require("protoclass");
var _bind      = require("../utils/bind");

/**
 */

function Component(options) {

  this.attributes    = options.attributes;
  this.childTemplate = options.childTemplate;
  this.view          = options.view;
  this.section       = options.section;
  this.document   = this.view.template.document;
  this.didChange     = _bind(this.didChange, this);

  // initialize the DOM elements
  this.initialize();
}

/**
 */

module.exports = protoclass(Component, {

  /**
   */

  initialize: function() {
    // override me - this is where the DOM elements should be added to the
    // section
  },

  /**
   */

  bind: function() {
    this.update();
  },

  /**
   */

  didChange: function() {
    this.view.runloop.deferOnce(this);
  },

  /**
   */

  unbind: function() {
    if (this._changeListener) this._changeListener.dispose();
  },

  /**
   */

  update: function() {
    // apply DOM changes here
  }
});

},{"../utils/bind":71,"protoclass":80}],20:[function(require,module,exports){
var BaseComponent  = require("./base");

/**
 */

function RepeatComponent(options) {
  BaseComponent.call(this, options);
}

/**
 */

function _each(target, iterate) {
  if (Object.prototype.toString.call(target) === "[object Array]") {
    for (var i = 0, n = target.length; i < n; i++) iterate(target[i], i);
  } else {
    for (var key in target) iterate(target[key], key);
  }
}

/**
 */

module.exports = BaseComponent.extend({

  /**
   */

  update: function() {

    if (this._updateListener) this._updateListener.dispose();

    var name     = this.attributes.as;
    var key      = this.attributes.key || "index";
    var source   = this.attributes.each;
    var accessor = this.view.accessor;

    if (!source) source = [];

    // note - this should get triggered on rAF
    this._updateListener = accessor.watchEvent(source, "change", function() {
      self.view.runloop.deferOnce(self);
    });

    source = accessor.normalizeCollection(source);

    if (!this._children) this._children = [];
    var self = this;
    var properties;

    var n = 0;

    _each(source, function(model, i) {

      if (name) {
        properties = {};
        properties[key]  = i;
        properties[name] = model;
      } else {
        properties = model;
      }

      if (i < self._children.length) {
        var c = self._children[i];

        // model is different? rebind. Otherwise ignore
        if (c.context === model || c.context[name] !== model) {
          c.bind(properties);
        }
      } else {

        // cannot be this - must be default scope
        var child = self.childTemplate.view(properties, {
          parent: self.view
        });

        self._children.push(child);
        self.section.appendChild(child.render());
      }

      n++;
    });

    this._children.splice(n).forEach(function(child) {
      child.dispose();
    });
  }
});

},{"./base":19}],21:[function(require,module,exports){
var BaseComponent  = require("./base");

/**
 */

function ShowComponent(options) {
  BaseComponent.call(this, options);
}

/**
 */

module.exports = BaseComponent.extend(ShowComponent, {

  /**
   */

  update: function() {

    var show = !!this.attributes.when;

    if (this._show === show) return;

    this._show = show;

    if (show) {
      this._view = this.childTemplate.view(this.view.context);
      this.section.appendChild(this._view.render());
    } else {
      if (this._view) this._view.dispose();
      this._view = void 0;
    }
  }
});

},{"./base":19}],22:[function(require,module,exports){
var BaseComponent = require("./base");

/**
 */

function StackComponent(options) {
  BaseComponent.call(this, options);

  var self = this;

  this.childTemplates = this.childTemplate.vnode.children.map(function(vnode) {
    return self.childTemplate.child(vnode);
  });
}

/**
 */

module.exports = BaseComponent.extend(StackComponent, {

  /**
   */

  update: function() {

    var currentTpl;
    var show = this.attributes.state;

    if (typeof show === "number") {
      currentTpl = this.childTemplates[show];
    } else {

      // match by name
      for (var i = this.childTemplates.length; i--;) {
        var childTemplate = this.childTemplates[i];
        if (childTemplate.vnode.attributes.name === show) {
          currentTpl = childTemplate;
          break;
        }
      }
    }

    if (this.currentTemplate === currentTpl) return;
    this.currentTemplate = currentTpl;
    if (this.currentView) this.currentView.dispose();
    if (!currentTpl) return;
    this.currentView = currentTpl.view(this.view.context, {
      parent: this.view
    });
    this.currentTemplate = currentTpl;
    this.section.appendChild(this.currentView.render());
  }
});

},{"./base":19}],23:[function(require,module,exports){
var BaseComponent = require("./base");
var _bind         = require("../utils/bind");

/**
 */

function SwitchComponent(options) {
  BaseComponent.call(this, options);

  var self = this;

  this.childTemplates = this.childTemplate.vnode.children.map(function(vnode) {
    return self.childTemplate.child(vnode);
  });
}

/**
 */

module.exports = BaseComponent.extend(SwitchComponent, {

  /**
   */

  bind: function() {
    BaseComponent.prototype.bind.call(this);

    this.bindings = [];
    var update = _bind(this.update, this);
    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      var when = this.childTemplates[i].vnode.attributes.when;
      if (!when) continue;
      this.bindings.push(when.watch(this.view, this.didChange));
    }
  },

  /**
   */

  unbind: function() {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].dispose();
    }
  },

  /**
   */

  update: function() {

    var child;

    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      child = this.childTemplates[i];
      var when = child.vnode.attributes.when;

      if (!when || when.evaluate(this.view)) {
        break;
      }
    }

    if (this.currentChild == child) {

      if (this._view && this._view.context !== this.context) {
        this._view.bind(this.view.context);
      }

      return;
    }

    if (this._view) {
      this._view.dispose();
    }

    if (i == n) return;

    this.currentChild = child;

    var childChildTemplate = child.child(child.vnode.children, {
      accessor: this.view.accessor
    });

    this._view = childChildTemplate.view(this.view.context);
    this.section.appendChild(this._view.render());
  }
});

},{"../utils/bind":71,"./base":19}],24:[function(require,module,exports){
(function (global){
var BaseComponent  = require("./base");

/**
 */

function EscapeComponent(options) {
  BaseComponent.call(this, options);
}

/**
 */

module.exports = BaseComponent.extend(EscapeComponent, {

  /**
   */

  update: function() {

    var value = this.attributes.html;

    // dirty check if is a binding
    if (typeof value === "object" && value.evaluate) {
      value = void 0;
    }

    // has a remove script
    if (this.currentValue && this.currentValue.remove) {
      this.currentValue.remove();
    }

    this.currentValue = value;

    if (!value) {
      return this.section.removeAll();
    }

    var node;

    if (value.render) {

      value.remove();
      node = value.render();
    } else if (value.nodeType != null) {
      node = value;
    } else {
      if (this.document !== global.document) {
        node = this.document.createTextNode(String(value));
      } else {
        var div = this.document.createElement("div");
        div.innerHTML = String(value);
        node = this.document.createDocumentFragment();
        var cn = Array.prototype.slice.call(div.childNodes);
        for (var i = 0, n = cn.length; i < n; i++) {
          node.appendChild(cn[i]);
        }
      }
    }

    this.section.replaceChildNodes(node);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./base":19}],25:[function(require,module,exports){
(function (process){
var Runloop       = require("./runloop");
var POJOAccessor  = require("./accessors/pojo");

module.exports = {

  /**
   * Scope class to use for paperclip - allows for other frameworks
   * to hook into paperclip.
   */

  accessorClass: POJOAccessor,

  /**
   */

  accessors: {
    pojo: require("./accessors/pojo")
  },

  /**
   * Default "web" components
   */

  components : {
    repeat : require("./components/repeat"),
    stack  : require("./components/stack"),
    switch : require("./components/switch"),
    show   : require("./components/show"),
    unsafe : require("./components/unsafe")
  },

  /**
   * default attribute helpers (similar to angular directives)
   */

  attributes : {
    value        : require("./attributes/value"),
    checked      : require("./attributes/value"),
    enable       : require("./attributes/enable"),
    focus        : require("./attributes/focus"),
    style        : require("./attributes/style"),
    class        : require("./attributes/class"),
    easein       : require("./attributes/easeIn"),
    easeout      : require("./attributes/easeOut"),

    // events
    onclick       : require("./attributes/event"),
    ondoubleclick : require("./attributes/event"),
    onfocus       : require("./attributes/event"),
    onload        : require("./attributes/event"),
    onsubmit      : require("./attributes/event"),
    onmousedown   : require("./attributes/event"),
    onchange      : require("./attributes/event"),
    onmouseup     : require("./attributes/event"),
    onmouseover   : require("./attributes/event"),
    onmouseout    : require("./attributes/event"),
    onfocusin     : require("./attributes/event"),
    onfocusout    : require("./attributes/event"),
    onmousemove   : require("./attributes/event"),
    onkeydown     : require("./attributes/event"),
    onkeyup       : require("./attributes/event"),
    ondragover    : require("./attributes/event"),
    ondragenter   : require("./attributes/event"),
    ondragleave   : require("./attributes/event"),
    onselectstart : require("./attributes/event"),
    ondrop        : require("./attributes/event"),

    // additional events
    onenter       : require("./attributes/enter"),
    ondelete      : require("./attributes/delete"),
    onescape      : require("./attributes/escape"),
    ondragstart   : require("./attributes/defaultEvent"),
    ondragend     : require("./attributes/defaultEvent")
  },

  /**
   * runs async operations
   */

  runloop: new Runloop({
    tick: process.env.PC_DEBUG ? process.nextTick : process.env.browser ? void 0 : void 0
  }),

  /**
   * {{ block | modifiers }}
   */

  modifiers: {
    uppercase: function(value) {
      return String(value).toUpperCase();
    },
    lowercase: function(value) {
      return String(value).toLowerCase();
    },
    titlecase: function(value) {
      var str;

      str = String(value);
      return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
    json: function(value, count, delimiter) {
      return JSON.stringify.apply(JSON, arguments);
    },
    isNaN: function(value) {
      return isNaN(value);
    },
    round: Math.round
  }
};

}).call(this,require('_process'))
},{"./accessors/pojo":3,"./attributes/class":5,"./attributes/defaultEvent":6,"./attributes/delete":7,"./attributes/easeIn":8,"./attributes/easeOut":9,"./attributes/enable":10,"./attributes/enter":11,"./attributes/escape":12,"./attributes/event":13,"./attributes/focus":14,"./attributes/style":17,"./attributes/value":18,"./components/repeat":20,"./components/show":21,"./components/stack":22,"./components/switch":23,"./components/unsafe":24,"./runloop":49,"_process":77}],26:[function(require,module,exports){
var BaseExpression       = require("./base");
var ParametersExpression = require("./parameters");

/**
 */

function ArrayExpression(expressions) {
  this.expressions = expressions || new ParametersExpression();
  BaseExpression.apply(this, arguments);
}

/**
 */

BaseExpression.extend(ArrayExpression, {

  /**
   */

  type: "array",

  /**
   */

  toJavaScript: function() {
    return "[" + this.expressions.toJavaScript() + "]";
  }
});

module.exports = ArrayExpression;

},{"./base":28,"./parameters":40}],27:[function(require,module,exports){
var BaseExpression = require("./base");

/**
 */

function AssignmentExpression(reference, value) {
  BaseExpression.apply(this, arguments);
  this.reference = reference;
  this.value     = value;
}

/**
 */

BaseExpression.extend(AssignmentExpression, {

  /**
   */

  type: "assignment",

  /**
   */

  toJavaScript: function() {

    var path = this.reference.path.join(".");

    return "this.set('" + path + "', " + this.value.toJavaScript() + ")";
  }
});

module.exports = AssignmentExpression;

},{"./base":28}],28:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseExpression() {
  this._children = [];
  this._addChildren(Array.prototype.slice.call(arguments, 0));
}

protoclass(BaseExpression, {

  /**
   */

  __isExpression: true,

  /**
   */

  _addChildren: function(children) {
    for (var i = children.length; i--;) {
      var child = children[i];
      if (!child) continue;
      if (child.__isExpression) {
        this._children.push(child);
      } else if (typeof child === "object") {
        for (var k in child) {
          this._addChildren([child[k]]);
        }
      }
    }
  },

  /**
   */

  filterAllChildren: function(filter) {
    var filtered = [];

    this.traverseChildren(function(child) {
      if (filter(child)) {
        filtered.push(child);
      }
    });

    return filtered;
  },

  /**
   */

  traverseChildren: function(fn) {

    fn(this);

    for (var i = this._children.length; i--;) {
      var child = this._children[i];
      child.traverseChildren(fn);
    }
  }
});

module.exports = BaseExpression;

},{"protoclass":80}],29:[function(require,module,exports){
var BaseExpression = require("./base");

function BlockBindingExpression(scripts, contentTemplate, childBlock) {
  this.scripts    = scripts;
  this.contentTemplate = contentTemplate;
  this.childBlock = childBlock;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(BlockBindingExpression, {
  type: "blockBinding",
  toJavaScript: function() {

    var buffer = "block(" + this.scripts.value.value.toJavaScript() + ", ";
    buffer += (this.contentTemplate ? this.contentTemplate.toJavaScript() : "void 0");

    if (this.childBlock) {
      buffer += ", " + this.childBlock.toJavaScript();
    }

    return buffer + ")";
  }
});

module.exports = BlockBindingExpression;

},{"./base":28}],30:[function(require,module,exports){
var BaseExpression = require("./base");

function CallExpression(reference, parameters) {
  this.reference  = reference;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CallExpression, {
  type: "call",
  toJavaScript: function() {

    var path = this.reference.path.concat();

    var buffer = "this.call(";

    buffer += "'" + path.join(".") + "'";

    buffer += ", [" + this.parameters.toJavaScript() + "]";

    return buffer + ")";
  }
});

module.exports = CallExpression;

},{"./base":28}],31:[function(require,module,exports){
var BaseExpression = require("./base");

function CommentNodeExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CommentNodeExpression, {
  type: "commentNode",
  toJavaScript: function() {
    return "comment(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = CommentNodeExpression;

},{"./base":28}],32:[function(require,module,exports){
var BaseExpression = require("./base");

function DoctypeExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(DoctypeExpression, {
  type: "doctype",
  toJavaScript: function() {
    return "text('<!DOCTYPE " + this.value + ">')";
  }
});

module.exports = DoctypeExpression;

},{"./base":28}],33:[function(require,module,exports){
var BaseExpression  = require("./base");
var ArrayExpression = require("./array");

function ElementNodeExpression(nodeName, attributes, childNodes) {
  this.name       = nodeName;
  this.attributes = attributes;
  this.childNodes = childNodes || new ArrayExpression();
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ElementNodeExpression, {
  type: "elementNode",
  toJavaScript: function() {
    return "element(\"" + this.name + "\", " + this.attributes.toJavaScript() +
    ", " + this.childNodes.toJavaScript() + ")";
  }
});

module.exports = ElementNodeExpression;

},{"./array":26,"./base":28}],34:[function(require,module,exports){
var BaseExpression = require("./base");

function GroupExpression(expression) {
  this.expression = expression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(GroupExpression, {
  type: "call",
  toJavaScript: function() {
    return "(" + this.expression.toJavaScript() + ")";
  }
});

module.exports = GroupExpression;

},{"./base":28}],35:[function(require,module,exports){
var BaseExpression = require("./base");

function HashExpression(values) {
  this.value = values;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(HashExpression, {
  type: "hash",
  toJavaScript: function() {

    var items = [];

    for (var key in this.value) {
      var v = this.value[key];
      items.push("'" + key + "':" + v.toJavaScript());
    }

    return "{" + items.join(", ") + "}";
  }
});

module.exports = HashExpression;

},{"./base":28}],36:[function(require,module,exports){
var BaseExpression = require("./base");

function LiteralExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(LiteralExpression, {
  type: "literal",
  toJavaScript: function() {
    return String(this.value);
  }
});

module.exports = LiteralExpression;

},{"./base":28}],37:[function(require,module,exports){
var BaseExpression = require("./base");

function ModifierExpression(name, parameters) {
  this.name  = name;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ModifierExpression, {
  type: "modifier",
  toJavaScript: function() {

    var buffer = "modifiers." + this.name + ".call(this";

    var params = this.parameters.toJavaScript();

    if (params.length) {
      buffer += ", " + params;
    }

    return buffer + ")";

  }
});

module.exports = ModifierExpression;

},{"./base":28}],38:[function(require,module,exports){
var BaseExpression = require("./base");

function NotExpression(operator, expression) {
  this.operator = operator;
  this.expression = expression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(NotExpression, {
  type: "!",
  toJavaScript: function() {
    return this.operator + this.expression.toJavaScript();
  }
});

module.exports = NotExpression;

},{"./base":28}],39:[function(require,module,exports){
var BaseExpression = require("./base");

function OperatorExpression(operator, left, right) {
  this.operator = operator;
  this.left     = left;
  this.right    = right;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(OperatorExpression, {
  type: "operator",
  toJavaScript: function() {
    return this.left.toJavaScript() + this.operator + this.right.toJavaScript();
  }
});

module.exports = OperatorExpression;

},{"./base":28}],40:[function(require,module,exports){
var BaseExpression = require("./base");

function ParametersExpression(expressions) {
  this.expressions = expressions || [];
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ParametersExpression, {
  type: "parameters",
  toJavaScript: function() {
    return this.expressions.map(function(expression) {
      return expression.toJavaScript();
    }).join(", ");
  }
});

module.exports = ParametersExpression;

},{"./base":28}],41:[function(require,module,exports){
var BaseExpression = require("./base");

function ReferenceExpression(path, bindingType) {

  this.path        = path;
  this.bindingType = bindingType;
  this.fast        = bindingType === "^";
  this.unbound     = ["~", "~>"].indexOf(bindingType) !== -1;
  this._isBoundTo  = ~["<~", "<~>", "~>"].indexOf(this.bindingType);

  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ReferenceExpression, {
  type: "reference",
  toJavaScript: function() {

    if (!this._isBoundTo)
    if (this.fast) {
      return "this.context." + this.path.join(".");
    }

    // var path = this.path.map(function(p) { return "'" + p + "'"; }).join(", ");

    var path = this.path.join(".");

    if (this._isBoundTo) {
      return "this.reference('" + path + "', " + (this.bindingType !== "<~") + ", " + (this.bindingType !== "~>") + ")";
    }

    return "this.get('" + path + "')";
  }
});

module.exports = ReferenceExpression;

},{"./base":28}],42:[function(require,module,exports){
var BaseExpression = require("./base");

function RootExpression(children) {
  this.childNodes = children;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(RootExpression, {
  type: "rootNode",
  toJavaScript: function() {

    var buffer = "(function(fragment, block, element, text, comment, parser, modifiers) { ";

    var element;

    if (this.childNodes.type === "array") {
      if (this.childNodes.expressions.expressions.length > 1) {
        element = "fragment(" + this.childNodes.toJavaScript() + ")";
      } else if (this.childNodes.expressions.expressions.length) {
        element = this.childNodes.expressions.expressions[0].toJavaScript();
      } else {
        return buffer + "})";
      }
    } else {
      element = this.childNodes.toJavaScript();
    }

    return buffer + "return " + element + "; })";
  }
});

module.exports = RootExpression;

},{"./base":28}],43:[function(require,module,exports){
var BaseExpression = require("./base");
var uniq           = require("../../utils/uniq");

function ScriptExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ScriptExpression, {
  type: "script",
  toJavaScript: function() {

    var refs = this.filterAllChildren(function(child) {
      return child.type === "reference";
    }).filter(function(reference) {
      return !reference.unbound && reference.path;
    }).map(function(reference) {
      return reference.path;
    });

    // remove duplicate references
    refs = uniq(refs.map(function(ref) {
      return ref.join(".");
    }));

    // much slower - use strings instead
    // refs = refs.map(function(ref) {
    //   return ref.split(".");
    // });

    var buffer = "{";

    buffer += "run: function() { return " + this.value.toJavaScript() + "; }";

    buffer += ", refs: " + JSON.stringify(refs);

    return buffer + "}";
  }
});

module.exports = ScriptExpression;

},{"../../utils/uniq":76,"./base":28}],44:[function(require,module,exports){
var BaseExpression = require("./base");

function StringExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(StringExpression, {
  type: "string",
  toJavaScript: function() {
    return "\"" + this.value.replace(/"/g, "\\\"") + "\"";
  }
});

module.exports = StringExpression;

},{"./base":28}],45:[function(require,module,exports){
var BaseExpression = require("./base");

function TernaryConditionExpression(condition, tExpression, fExpression) {
  this.condition = condition;
  this.tExpression = tExpression;
  this.fExpression = fExpression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TernaryConditionExpression, {
  type: "ternaryCondition",
  toJavaScript: function() {
    return this.condition.toJavaScript()  +
    "?" + this.tExpression.toJavaScript() +
    ":" + this.fExpression.toJavaScript();
  }
});

module.exports = TernaryConditionExpression;

},{"./base":28}],46:[function(require,module,exports){
(function (global){
var BaseExpression = require("./base");
// var he = require("he");

function TextNodeExpression(value) {
  if (global.paperclip && global.paperclip.he) {
    this.value = global.paperclip.he.decode(value);
  } else if (typeof window !== "undefined") {
    var div = document.createElement("div");
    div.innerHTML = value;
    this.value = div.textContent;
  } else {
    this.value = value;
  }

  // this.value = he.decode(value);

  // FIXME:
  // will be invalid if value is something like 'a'
  this.decoded = this.value !== value;

  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TextNodeExpression, {
  type: "textNode",
  toJavaScript: function() {
    return "text(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = TextNodeExpression;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./base":28}],47:[function(require,module,exports){
(function (global){
var parser  = require("./parser");
var scripts = {};
var parse;

/**
 */

module.exports = {

  /**
   */

  parse: parse = function(html) {
    return "\"use strict\";module.exports = " + parser.parse(html).toJavaScript();
  },

  /**
   */

  compile: function(nameOrContent) {
    var content;

    if (scripts[nameOrContent]) {
      return scripts[nameOrContent];
    }

    if (!content) {
      content = nameOrContent;
    }

    var source = "\"use strict\";return " + parser.parse(content).toJavaScript();

    return (scripts[nameOrContent] = new Function(source)());
  }
};

/* istanbul ignore if */
if (global.paperclip) {
  global.paperclip.parse           = module.exports.parse;
  global.paperclip.template.parser = module.exports;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./parser":48}],48:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleIndices = { Start: 0 },
        peg$startRuleIndex   = 0,

        peg$consts = [
          function(children) { return new RootNodeExpression(children); },
          peg$FAILED,
          "<!DOCTYPE",
          { type: "literal", value: "<!DOCTYPE", description: "\"<!DOCTYPE\"" },
          [],
          /^[^>]/,
          { type: "class", value: "[^>]", description: "[^>]" },
          ">",
          { type: "literal", value: ">", description: "\">\"" },
          function(info) {
                return new DocTypeExpression(info.join(""));
              },
          function(children) { return new ArrayExpression(new ParametersExpression(trimTextExpressions(children))); },
          "<!--",
          { type: "literal", value: "<!--", description: "\"<!--\"" },
          void 0,
          "-->",
          { type: "literal", value: "-->", description: "\"-->\"" },
          function(v) { return v; },
          function(value) {
              return new CommentNodeExpression(trimEnds(value.join("")));
            },
          "<",
          { type: "literal", value: "<", description: "\"<\"" },
          "area",
          { type: "literal", value: "area", description: "\"area\"" },
          "base",
          { type: "literal", value: "base", description: "\"base\"" },
          "br",
          { type: "literal", value: "br", description: "\"br\"" },
          "col",
          { type: "literal", value: "col", description: "\"col\"" },
          "command",
          { type: "literal", value: "command", description: "\"command\"" },
          "embed",
          { type: "literal", value: "embed", description: "\"embed\"" },
          "hr",
          { type: "literal", value: "hr", description: "\"hr\"" },
          "img",
          { type: "literal", value: "img", description: "\"img\"" },
          "input",
          { type: "literal", value: "input", description: "\"input\"" },
          "keygen",
          { type: "literal", value: "keygen", description: "\"keygen\"" },
          "link",
          { type: "literal", value: "link", description: "\"link\"" },
          "meta",
          { type: "literal", value: "meta", description: "\"meta\"" },
          "param",
          { type: "literal", value: "param", description: "\"param\"" },
          "source",
          { type: "literal", value: "source", description: "\"source\"" },
          "track",
          { type: "literal", value: "track", description: "\"track\"" },
          "wbr",
          { type: "literal", value: "wbr", description: "\"wbr\"" },
          null,
          "/>",
          { type: "literal", value: "/>", description: "\"/>\"" },
          function(nodeName, attributes, endTag) {


              if (endTag && nodeName != endTag.name) {
                expected("</" + nodeName + ">");
              }

              return new ElementNodeExpression(nodeName, attributes);
            },
          "</",
          { type: "literal", value: "</", description: "\"</\"" },
          function(name) {
                return {
                  name: name
                };
              },
          function(startTag, children, endTag) {

              if (startTag.name != endTag.name) {
                expected("</" + startTag.name + ">");
              }

              return new ElementNodeExpression(startTag.name, startTag.attributes, children);
            },
          function(value) {
                return new TextNodeExpression(trimNewLineChars(value.join("")));
              },
          "{{",
          { type: "literal", value: "{{", description: "\"{{\"" },
          function() {
                return text();
              },
          function(info) { return info; },
          function(info) { return new ElementNodeExpression(info.name, info.attributes); },
          function(name, attrs) {
                return {
                  name: name,
                  attributes: attrs
                };
              },
          function(attributes) {
                var attrs = {};

                for (var i = 0, n = attributes.length; i < n; i++) {
                  var attr = attributes[i];
                  attrs[attr.name] = attr.value || true;
                }

                return new HashExpression(attrs);
            },
          /^[a-zA-Z0-9:_.\-]/,
          { type: "class", value: "[a-zA-Z0-9:_.\\-]", description: "[a-zA-Z0-9:_.\\-]" },
          function(word) { return word.join(""); },
          "=",
          { type: "literal", value: "=", description: "\"=\"" },
          function(name, values) {
                return {
                  name: name,
                  value: values
                };
              },
          function(name) {
                return {
                  name: name,
                  value: new LiteralExpression(true)
                };
              },
          "\"",
          { type: "literal", value: "\"", description: "\"\\\"\"" },
          /^[^"]/,
          { type: "class", value: "[^\"]", description: "[^\"]" },
          function() { return new StringExpression(trimNewLineChars(text())); },
          function(values) { return attrValues(values); },
          "'",
          { type: "literal", value: "'", description: "\"'\"" },
          /^[^']/,
          { type: "class", value: "[^']", description: "[^']" },
          function(binding) { return attrValues([binding]); },
          "{{#",
          { type: "literal", value: "{{#", description: "\"{{#\"" },
          function(blockBinding) { return blockBinding; },
          function(scripts, fragment, child) {
                return new BlockBindingExpression(scripts, fragment, child);
              },
          "{{/",
          { type: "literal", value: "{{/", description: "\"{{/\"" },
          function(blockBinding) { return new RootNodeExpression(blockBinding); },
          "{{/}}",
          { type: "literal", value: "{{/}}", description: "\"{{/}}\"" },
          function() { return void 0; },
          "}}",
          { type: "literal", value: "}}", description: "\"}}\"" },
          function(scripts) {
                return new BlockBindingExpression(scripts);
              },
          function(scripts) {
                return scripts;
              },
          function(scriptName) {
                var hash = {};
                hash[scriptName] = new ScriptExpression(new LiteralExpression(true));
                return new HashExpression(hash);
              },
          function(scripts) {
                for (var k in scripts) {
                  scripts[k] = new ScriptExpression(scripts[k]);
                }
                return new HashExpression(scripts);
              },
          ",",
          { type: "literal", value: ",", description: "\",\"" },
          function(value, ascripts) {

                var scripts = {
                  value: new ScriptExpression(value)
                };

                ascripts = ascripts.length ? ascripts[0][1] : [];
                for (var i = 0, n = ascripts.length; i < n; i++) {
                  scripts[ascripts[i].key] = new ScriptExpression(ascripts[i].value);
                }

                return new HashExpression(scripts);
              },
          "?",
          { type: "literal", value: "?", description: "\"?\"" },
          ":",
          { type: "literal", value: ":", description: "\":\"" },
          function(condition, left, right) {
                return new TernaryConditionExpression(condition, left, right);
              },
          "(",
          { type: "literal", value: "(", description: "\"(\"" },
          ")",
          { type: "literal", value: ")", description: "\")\"" },
          function(params) {
                return params;
              },
          "()",
          { type: "literal", value: "()", description: "\"()\"" },
          function() { return []; },
          function(param1, rest) {
                return [param1].concat(rest.map(function(v) {
                  return v[1];
                }));
              },
          function(left, right) {
                return new AssignmentExpression(left, right);
              },
          "&&",
          { type: "literal", value: "&&", description: "\"&&\"" },
          "||",
          { type: "literal", value: "||", description: "\"||\"" },
          "===",
          { type: "literal", value: "===", description: "\"===\"" },
          "==",
          { type: "literal", value: "==", description: "\"==\"" },
          "!==",
          { type: "literal", value: "!==", description: "\"!==\"" },
          "!=",
          { type: "literal", value: "!=", description: "\"!=\"" },
          ">==",
          { type: "literal", value: ">==", description: "\">==\"" },
          ">=",
          { type: "literal", value: ">=", description: "\">=\"" },
          "<==",
          { type: "literal", value: "<==", description: "\"<==\"" },
          "<=",
          { type: "literal", value: "<=", description: "\"<=\"" },
          "+",
          { type: "literal", value: "+", description: "\"+\"" },
          "-",
          { type: "literal", value: "-", description: "\"-\"" },
          "%",
          { type: "literal", value: "%", description: "\"%\"" },
          "*",
          { type: "literal", value: "*", description: "\"*\"" },
          "/",
          { type: "literal", value: "/", description: "\"/\"" },
          function(left, operator, right) {
                return new OperatorExpression(operator, left, right);
              },
          function(value) { return value; },
          function(expression, modifiers) {

                for (var i = 0, n = modifiers.length; i < n; i++) {
                  expression = new ModifierExpression(modifiers[i].name, new ParametersExpression([expression].concat(modifiers[i].parameters)));
                }

                return expression;
              },
          "|",
          { type: "literal", value: "|", description: "\"|\"" },
          function(name, parameters) {
              return {
                name: name,
                parameters: parameters || []
              };
            },
          function(context) { return context; },
          "!",
          { type: "literal", value: "!", description: "\"!\"" },
          function(not, value) {
                return new NotExpression(not, value);
              },
          /^[0-9]/,
          { type: "class", value: "[0-9]", description: "[0-9]" },
          function(value) {
                return new LiteralExpression(parseFloat(text()));
              },
          ".",
          { type: "literal", value: ".", description: "\".\"" },
          function(group) { return new GroupExpression(group); },
          function(expression) {
                return new LiteralExpression(expression.value);
              },
          "true",
          { type: "literal", value: "true", description: "\"true\"" },
          "false",
          { type: "literal", value: "false", description: "\"false\"" },
          function(value) {
                return {
                  type: "boolean",
                  value: value === "true"
                };
              },
          "undefined",
          { type: "literal", value: "undefined", description: "\"undefined\"" },
          function() { return { type: "undefined", value: void 0 }; },
          "NaN",
          { type: "literal", value: "NaN", description: "\"NaN\"" },
          function() { return { type: "nan", value: NaN }; },
          "Infinity",
          { type: "literal", value: "Infinity", description: "\"Infinity\"" },
          function() { return { type: "infinity", value: Infinity }; },
          "null",
          { type: "literal", value: "null", description: "\"null\"" },
          "NULL",
          { type: "literal", value: "NULL", description: "\"NULL\"" },
          function() { return { type: "null", value: null }; },
          function(reference, parameters) {
                return new CallExpression(reference, new ParametersExpression(parameters));
              },
          "^",
          { type: "literal", value: "^", description: "\"^\"" },
          "~>",
          { type: "literal", value: "~>", description: "\"~>\"" },
          "<~>",
          { type: "literal", value: "<~>", description: "\"<~>\"" },
          "~",
          { type: "literal", value: "~", description: "\"~\"" },
          "<~",
          { type: "literal", value: "<~", description: "\"<~\"" },
          function(bindingType, reference, path) {
                path = [reference].concat(path.map(function(p) { return p[1]; }));
                return new ReferenceExpression(path, bindingType);
              },
          /^[a-zA-Z_$0-9]/,
          { type: "class", value: "[a-zA-Z_$0-9]", description: "[a-zA-Z_$0-9]" },
          function(name) { return text(); },
          "{",
          { type: "literal", value: "{", description: "\"{\"" },
          "}",
          { type: "literal", value: "}", description: "\"}\"" },
          function(values) {
                return new HashExpression(values);
              },
          function(values) {
                var s = {};
                for (var i = 0, n = values.length; i < n; i++) {
                  s[values[i].key] = values[i].value;
                }
                return s;
              },
          function(firstValue, additionalValues) {
                return [
                  firstValue
                ].concat(additionalValues.length ? additionalValues[0][1] : []);
              },
          function(key, value) {
                return {
                  key: key,
                  value: value || new LiteralExpression(void 0)
                };
              },
          function(key) { return key.value; },
          function(key) { return key; },
          { type: "other", description: "string" },
          function(chars) {
                return new StringExpression(chars.join(""));
              },
          "\\",
          { type: "literal", value: "\\", description: "\"\\\\\"" },
          function() { return text(); },
          "\\\"",
          { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
          "\\'",
          { type: "literal", value: "\\'", description: "\"\\\\'\"" },
          { type: "any", description: "any character" },
          /^[a-zA-Z]/,
          { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
          function(chars) { return chars.join(""); },
          /^[ \n\r\t]/,
          { type: "class", value: "[ \\n\\r\\t]", description: "[ \\n\\r\\t]" },
          /^[\n\r\t]/,
          { type: "class", value: "[\\n\\r\\t]", description: "[\\n\\r\\t]" }
        ],

        peg$bytecode = [
          peg$decode("7!"),
          peg$decode("!7#+' 4!6 !! %"),
          peg$decode("!.\"\"\"2\"3#+q$7Z+g% $0%\"\"1!3&+,$,)&0%\"\"1!3&\"\"\" !+B%7Z+8%.'\"\"2'3(+(%4%6)%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("! $7%*5 \"7'*/ \"7$*) \"7(*# \"72,;&7%*5 \"7'*/ \"7$*) \"7(*# \"72\"+' 4!6*!! %"),
          peg$decode("!7Z+\xC7$.+\"\"2+3,+\xB7% $!!8..\"\"2.3/9*$$\"\" -\"# !+2$7X+(%4\"60\"! %$\"# !\"# !+T$,Q&!!8..\"\"2.3/9*$$\"\" -\"# !+2$7X+(%4\"60\"! %$\"# !\"# !\"\"\" !+B%..\"\"2.3/+2%7Z+(%4%61%!\"%$%# !$$# !$## !$\"# !\"# !*# \"7\""),
          peg$decode("!.2\"\"2233+\u0134$.4\"\"2435*\xD1 \".6\"\"2637*\xC5 \".8\"\"2839*\xB9 \".:\"\"2:3;*\xAD \".<\"\"2<3=*\xA1 \".>\"\"2>3?*\x95 \".@\"\"2@3A*\x89 \".B\"\"2B3C*} \".D\"\"2D3E*q \".F\"\"2F3G*e \".H\"\"2H3I*Y \".J\"\"2J3K*M \".L\"\"2L3M*A \".N\"\"2N3O*5 \".P\"\"2P3Q*) \".R\"\"2R3S+p%7-+f%.'\"\"2'3(*) \".U\"\"2U3V*# \" T+D%7Z+:%7&*# \" T+*%4&6W&#$# %$&# !$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!.X\"\"2X3Y+\xFC$.4\"\"2435*\xD1 \".6\"\"2637*\xC5 \".8\"\"2839*\xB9 \".:\"\"2:3;*\xAD \".<\"\"2<3=*\xA1 \".>\"\"2>3?*\x95 \".@\"\"2@3A*\x89 \".B\"\"2B3C*} \".D\"\"2D3E*q \".F\"\"2F3G*e \".H\"\"2H3I*Y \".J\"\"2J3K*M \".L\"\"2L3M*A \".N\"\"2N3O*5 \".P\"\"2P3Q*) \".R\"\"2R3S+8%.'\"\"2'3(+(%4#6Z#!!%$## !$\"# !\"# !"),
          peg$decode("!7*+>$7#+4%7.+*%4#6[##\"! %$## !$\"# !\"# !*# \"7+"),
          peg$decode("! $7)+&$,#&7)\"\"\" !+' 4!6\\!! %"),
          peg$decode("!!8.2\"\"2233*) \".]\"\"2]3^9*$$\"\" -\"# !+1$7X+'%4\"6_\" %$\"# !\"# !"),
          peg$decode("!7Z+\\$.2\"\"2233+L%7,+B%.'\"\"2'3(+2%7Z+(%4%6`%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7Z+\\$.2\"\"2233+L%7,+B%.U\"\"2U3V+2%7Z+(%4%6a%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7/+3$7-+)%4\"6b\"\"! %$\"# !\"# !"),
          peg$decode("!7Z+D$ $70,#&70\"+2%7Z+(%4#6c#!!%$## !$\"# !\"# !"),
          peg$decode("!.X\"\"2X3Y+B$7/+8%.'\"\"2'3(+(%4#6Z#!!%$## !$\"# !\"# !"),
          peg$decode("!7Z+M$ $0d\"\"1!3e+,$,)&0d\"\"1!3e\"\"\" !+(%4\"6f\"! %$\"# !\"# !"),
          peg$decode("!7/+W$7Z+M%.g\"\"2g3h+=%7Z+3%71+)%4%6i%\"$ %$%# !$$# !$## !$\"# !\"# !*/ \"!7/+' 4!6j!! %"),
          peg$decode("!.k\"\"2k3l+\u0146$ $76*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0m\"\"1!3n+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0m\"\"1!3n+#%'\"%$\"# !\"# !\"\"\" !+& 4!6o! %,\xA1&76*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0m\"\"1!3n+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0m\"\"1!3n+#%'\"%$\"# !\"# !\"\"\" !+& 4!6o! %\"+8%.k\"\"2k3l+(%4#6p#!!%$## !$\"# !\"# !*\u0169 \"!.q\"\"2q3r+\u0146$ $76*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0s\"\"1!3t+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0s\"\"1!3t+#%'\"%$\"# !\"# !\"\"\" !+& 4!6o! %,\xA1&76*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0s\"\"1!3t+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0s\"\"1!3t+#%'\"%$\"# !\"# !\"\"\" !+& 4!6o! %\"+8%.q\"\"2q3r+(%4#6p#!!%$## !$\"# !\"# !*/ \"!76+' 4!6u!! %"),
          peg$decode("!.v\"\"2v3w+2$73+(%4\"6x\"! %$\"# !\"# !*# \"75"),
          peg$decode("!77+R$7Z+H%7!+>%7Z+4%74+*%4%6y%#$\" %$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!.z\"\"2z3{+2$73+(%4\"6|\"! %$\"# !\"# !*B \"!.}\"\"2}3~+1$7Z+'%4\"6\" %$\"# !\"# !"),
          peg$decode("!.]\"\"2]3^+V$7Z+L%78+B%7Z+8%.\x80\"\"2\x803\x81+(%4%6\x82%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!.]\"\"2]3^+V$7Z+L%78+B%7Z+8%.\x80\"\"2\x803\x81+(%4%6\x83%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7Z+L$7O+B%7Z+8%.\x80\"\"2\x803\x81+(%4$6\x84$!\"%$$# !$## !$\"# !\"# !*M \"!78+B$7Z+8%.\x80\"\"2\x803\x81+(%4#6\x83#!\"%$## !$\"# !\"# !"),
          peg$decode("!7Q+' 4!6\x85!! %*\x90 \"!7Z+\x85$79+{%7Z+q% $!.\x86\"\"2\x863\x87+-$7R+#%'\"%$\"# !\"# !,>&!.\x86\"\"2\x863\x87+-$7R+#%'\"%$\"# !\"# !\"+)%4$6\x88$\"\" %$$# !$## !$\"# !\"# !"),
          peg$decode("!7<+^$.\x89\"\"2\x893\x8A+N%79+D%.\x8B\"\"2\x8B3\x8C+4%79+*%4%6\x8D%#$\" %$%# !$$# !$## !$\"# !\"# !*# \"7<"),
          peg$decode("!.\x8E\"\"2\x8E3\x8F+B$7;+8%.\x90\"\"2\x903\x91+(%4#6\x92#!!%$## !$\"# !\"# !*4 \"!.\x93\"\"2\x933\x94+& 4!6\x95! %"),
          peg$decode("!79+q$ $!.\x86\"\"2\x863\x87+-$79+#%'\"%$\"# !\"# !,>&!.\x86\"\"2\x863\x87+-$79+#%'\"%$\"# !\"# !\"+)%4\"6\x96\"\"! %$\"# !\"# !"),
          peg$decode("!7A+C$.g\"\"2g3h+3%7<+)%4#6\x97#\"\" %$## !$\"# !\"# !*# \"7="),
          peg$decode("!7>+\u0104$.\x98\"\"2\x983\x99*\xDD \".\x9A\"\"2\x9A3\x9B*\xD1 \".\x9C\"\"2\x9C3\x9D*\xC5 \".\x9E\"\"2\x9E3\x9F*\xB9 \".\xA0\"\"2\xA03\xA1*\xAD \".\xA2\"\"2\xA23\xA3*\xA1 \".\xA4\"\"2\xA43\xA5*\x95 \".\xA6\"\"2\xA63\xA7*\x89 \".'\"\"2'3(*} \".\xA8\"\"2\xA83\xA9*q \".\xAA\"\"2\xAA3\xAB*e \".2\"\"2233*Y \".\xAC\"\"2\xAC3\xAD*M \".\xAE\"\"2\xAE3\xAF*A \".\xB0\"\"2\xB03\xB1*5 \".\xB2\"\"2\xB23\xB3*) \".\xB4\"\"2\xB43\xB5+4%7=+*%4#6\xB6##\"! %$## !$\"# !\"# !*# \"7>"),
          peg$decode("!7Z+<$7?+2%7Z+(%4#6\xB7#!!%$## !$\"# !\"# !"),
          peg$decode("!7B+;$ $7@,#&7@\"+)%4\"6\xB8\"\"! %$\"# !\"# !*) \"7M*# \"7A"),
          peg$decode("!.\xB9\"\"2\xB93\xBA+W$7Z+M%7O+C%7:*# \" T+3%7Z+)%4%6\xBB%\"\"!%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7Z+<$7C+2%7Z+(%4#6\xBC#!!%$## !$\"# !\"# !"),
          peg$decode("!.\xBD\"\"2\xBD3\xBE*) \".\xAE\"\"2\xAE3\xAF+3$7B+)%4\"6\xBF\"\"! %$\"# !\"# !*/ \"7G*) \"7M*# \"7A"),
          peg$decode("7F*5 \"7P*/ \"7D*) \"7U*# \"7N"),
          peg$decode("!!.\xAE\"\"2\xAE3\xAF*# \" T+i$! $0\xC0\"\"1!3\xC1+,$,)&0\xC0\"\"1!3\xC1\"\"\" !+3$7E*# \" T+#%'\"%$\"# !\"# !*# \"7E+#%'\"%$\"# !\"# !+' 4!6\xC2!! %"),
          peg$decode("!.\xC3\"\"2\xC33\xC4+H$ $0\xC0\"\"1!3\xC1+,$,)&0\xC0\"\"1!3\xC1\"\"\" !+#%'\"%$\"# !\"# !"),
          peg$decode("!.\x8E\"\"2\x8E3\x8F+B$79+8%.\x90\"\"2\x903\x91+(%4#6\xC5#!!%$## !$\"# !\"# !"),
          peg$decode("!7H*5 \"7I*/ \"7L*) \"7J*# \"7K+' 4!6\xC6!! %"),
          peg$decode("!.\xC7\"\"2\xC73\xC8*) \".\xC9\"\"2\xC93\xCA+' 4!6\xCB!! %"),
          peg$decode("!.\xCC\"\"2\xCC3\xCD+& 4!6\xCE! %"),
          peg$decode("!.\xCF\"\"2\xCF3\xD0+& 4!6\xD1! %"),
          peg$decode("!.\xD2\"\"2\xD23\xD3+& 4!6\xD4! %"),
          peg$decode("!.\xD5\"\"2\xD53\xD6*) \".\xD7\"\"2\xD73\xD8+& 4!6\xD9! %"),
          peg$decode("!7A+3$7:+)%4\"6\xDA\"\"! %$\"# !\"# !"),
          peg$decode("!.\xDB\"\"2\xDB3\xDC*M \".\xDD\"\"2\xDD3\xDE*A \".\xDF\"\"2\xDF3\xE0*5 \".\xE1\"\"2\xE13\xE2*) \".\xE3\"\"2\xE33\xE4*# \" T+\x90$7Z+\x86%7O+|% $!.\xC3\"\"2\xC33\xC4+-$7O+#%'\"%$\"# !\"# !,>&!.\xC3\"\"2\xC33\xC4+-$7O+#%'\"%$\"# !\"# !\"+4%7Z+*%4%6\xE5%#$\"!%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("! $0\xE6\"\"1!3\xE7+,$,)&0\xE6\"\"1!3\xE7\"\"\" !+' 4!6\xE8!! %"),
          peg$decode("!.\xE9\"\"2\xE93\xEA+\\$7Z+R%7Q*# \" T+B%7Z+8%.\xEB\"\"2\xEB3\xEC+(%4%6\xED%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7R+' 4!6\xEE!! %"),
          peg$decode("!7S+q$ $!.\x86\"\"2\x863\x87+-$7R+#%'\"%$\"# !\"# !,>&!.\x86\"\"2\x863\x87+-$7R+#%'\"%$\"# !\"# !\"+)%4\"6\xEF\"\"! %$\"# !\"# !"),
          peg$decode("!7Z+]$7T+S%7Z+I%.\x8B\"\"2\x8B3\x8C+9%79*# \" T+)%4%6\xF0%\"# %$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7U+' 4!6\xF1!! %*/ \"!7O+' 4!6\xF2!! %"),
          peg$decode("8!.k\"\"2k3l+J$ $7V,#&7V\"+8%.k\"\"2k3l+(%4#6\xF4#!!%$## !$\"# !\"# !*[ \"!.q\"\"2q3r+J$ $7W,#&7W\"+8%.q\"\"2q3r+(%4#6\xF4#!!%$## !$\"# !\"# !9*\" 3\xF3"),
          peg$decode("!!8.k\"\"2k3l*) \".\xF5\"\"2\xF53\xF69*$$\"\" -\"# !+1$7X+'%4\"6\xF7\" %$\"# !\"# !*) \".\xF8\"\"2\xF83\xF9"),
          peg$decode("!!8.q\"\"2q3r*) \".\xF5\"\"2\xF53\xF69*$$\"\" -\"# !+1$7X+'%4\"6\xF7\" %$\"# !\"# !*) \".\xFA\"\"2\xFA3\xFB"),
          peg$decode("-\"\"1!3\xFC"),
          peg$decode("! $0\xFD\"\"1!3\xFE+,$,)&0\xFD\"\"1!3\xFE\"\"\" !+' 4!6\xFF!! %"),
          peg$decode(" $0\u0100\"\"1!3\u0101,)&0\u0100\"\"1!3\u0101\""),
          peg$decode(" $0\u0102\"\"1!3\u0103,)&0\u0102\"\"1!3\u0103\"")
        ],

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleIndices)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleIndex = peg$startRuleIndices[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$decode(s) {
      var bc = new Array(s.length), i;

      for (i = 0; i < s.length; i++) {
        bc[i] = s.charCodeAt(i) - 32;
      }

      return bc;
    }

    function peg$parseRule(index) {
      var bc    = peg$bytecode[index],
          ip    = 0,
          ips   = [],
          end   = bc.length,
          ends  = [],
          stack = [],
          params, i;

      function protect(object) {
        return Object.prototype.toString.apply(object) === "[object Array]" ? [] : object;
      }

      while (true) {
        while (ip < end) {
          switch (bc[ip]) {
            case 0:
              stack.push(protect(peg$consts[bc[ip + 1]]));
              ip += 2;
              break;

            case 1:
              stack.push(peg$currPos);
              ip++;
              break;

            case 2:
              stack.pop();
              ip++;
              break;

            case 3:
              peg$currPos = stack.pop();
              ip++;
              break;

            case 4:
              stack.length -= bc[ip + 1];
              ip += 2;
              break;

            case 5:
              stack.splice(-2, 1);
              ip++;
              break;

            case 6:
              stack[stack.length - 2].push(stack.pop());
              ip++;
              break;

            case 7:
              stack.push(stack.splice(stack.length - bc[ip + 1], bc[ip + 1]));
              ip += 2;
              break;

            case 8:
              stack.pop();
              stack.push(input.substring(stack[stack.length - 1], peg$currPos));
              ip++;
              break;

            case 9:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1]) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 10:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1] === peg$FAILED) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 11:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1] !== peg$FAILED) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 12:
              if (stack[stack.length - 1] !== peg$FAILED) {
                ends.push(end);
                ips.push(ip);

                end = ip + 2 + bc[ip + 1];
                ip += 2;
              } else {
                ip += 2 + bc[ip + 1];
              }

              break;

            case 13:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (input.length > peg$currPos) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 14:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (input.substr(peg$currPos, peg$consts[bc[ip + 1]].length) === peg$consts[bc[ip + 1]]) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 15:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (input.substr(peg$currPos, peg$consts[bc[ip + 1]].length).toLowerCase() === peg$consts[bc[ip + 1]]) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 16:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (peg$consts[bc[ip + 1]].test(input.charAt(peg$currPos))) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 17:
              stack.push(input.substr(peg$currPos, bc[ip + 1]));
              peg$currPos += bc[ip + 1];
              ip += 2;
              break;

            case 18:
              stack.push(peg$consts[bc[ip + 1]]);
              peg$currPos += peg$consts[bc[ip + 1]].length;
              ip += 2;
              break;

            case 19:
              stack.push(peg$FAILED);
              if (peg$silentFails === 0) {
                peg$fail(peg$consts[bc[ip + 1]]);
              }
              ip += 2;
              break;

            case 20:
              peg$reportedPos = stack[stack.length - 1 - bc[ip + 1]];
              ip += 2;
              break;

            case 21:
              peg$reportedPos = peg$currPos;
              ip++;
              break;

            case 22:
              params = bc.slice(ip + 4, ip + 4 + bc[ip + 3]);
              for (i = 0; i < bc[ip + 3]; i++) {
                params[i] = stack[stack.length - 1 - params[i]];
              }

              stack.splice(
                stack.length - bc[ip + 2],
                bc[ip + 2],
                peg$consts[bc[ip + 1]].apply(null, params)
              );

              ip += 4 + bc[ip + 3];
              break;

            case 23:
              stack.push(peg$parseRule(bc[ip + 1]));
              ip += 2;
              break;

            case 24:
              peg$silentFails++;
              ip++;
              break;

            case 25:
              peg$silentFails--;
              ip++;
              break;

            default:
              throw new Error("Invalid opcode: " + bc[ip] + ".");
          }
        }

        if (ends.length > 0) {
          end = ends.pop();
          ip = ips.pop();
        } else {
          break;
        }
      }

      return stack[0];
    }


    /*jshint laxcomma:false */

    var DoctypeExpression          = require("./ast/doctype");
    var RootNodeExpression         = require("./ast/rootNode");
    var TextNodeExpression         = require("./ast/textNode");
    var CommentNodeExpression      = require("./ast/commentNode");
    var ElementNodeExpression      = require("./ast/elementNode");
    var BlockBindingExpression     = require("./ast/blockBinding");
    var DocTypeExpression          = require("./ast/doctype");
    var TernaryConditionExpression = require("./ast/ternaryCondition");
    var AssignmentExpression       = require("./ast/assignment");
    var OperatorExpression         = require("./ast/operator");
    var NotExpression              = require("./ast/not");
    var LiteralExpression          = require("./ast/literal");
    var StringExpression           = require("./ast/string");
    var ReferenceExpression        = require("./ast/reference");
    var HashExpression             = require("./ast/hash");
    var ScriptExpression           = require("./ast/script");
    var CallExpression             = require("./ast/call");
    var ModifierExpression         = require("./ast/modifier");
    var ArrayExpression            = require("./ast/array");
    var ParametersExpression       = require("./ast/parameters");
    var GroupExpression            = require("./ast/group");

    function trimWhitespace(ws) {
      return trimNewLineChars(ws).replace(/(^\s+)|(\s+$)/, "");
    }

    function trimEnds(ws) {
      return ws.replace(/(^\s+)|(\s+$)/, "").replace(/[\r\n]/g, "\\n");
    }

    function trimNewLineChars(ws) {
      return ws.replace(/[ \r\n\t]+/g, " ");
    }

    function trimmedText() {
      return trimWhitespace(text());
    }

    function singleOrArrayExpression(values) {
      return values.length === 1 ? values[0] : new ArrayExpression(new ParametersExpression(values));
    }

    function attrValues(values) {

      values = values.filter(function(v) {
        return !/^[\n\t\r]+$/.test(v.value);
      });

      if (!values.length) {
        return new LiteralExpression(true);
      }

      if (values.length === 1 && values[0].type === "string") {
        return values[0];
      } else {
        return new ArrayExpression(new ParametersExpression(values));
      }
    }

    function trimTextExpressions(expressions) {

      function _trim(exprs) {
        var expr;
        for (var i = exprs.length; i--;) {
          expr = exprs[i];
          if (expr.type == "textNode" && !/\S/.test(expr.value) && !expr.decoded) {
            exprs.splice(i, 1);
          } else {
            break;
          }
        }
        return exprs;
      }

      return _trim(_trim(expressions.reverse()).reverse());
    }



    peg$result = peg$parseRule(peg$startRuleIndex);

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
},{"./ast/array":26,"./ast/assignment":27,"./ast/blockBinding":29,"./ast/call":30,"./ast/commentNode":31,"./ast/doctype":32,"./ast/elementNode":33,"./ast/group":34,"./ast/hash":35,"./ast/literal":36,"./ast/modifier":37,"./ast/not":38,"./ast/operator":39,"./ast/parameters":40,"./ast/reference":41,"./ast/rootNode":42,"./ast/script":43,"./ast/string":44,"./ast/ternaryCondition":45,"./ast/textNode":46}],49:[function(require,module,exports){
(function (process,global){
var protoclass = require("protoclass");

var rAF = (global.requestAnimationFrame      ||
          global.webkitRequestAnimationFrame ||
          global.mozRequestAnimationFrame    ||
          process.nextTick).bind(global);

/* istanbul ignore next */
if (process.browser) {
  var defaultTick = function(next) {
    rAF(next);
  };
} else {
  var defaultTick = function(next) {
    next();
  };
}

/**
 */

function RunLoop(options) {
  this._animationQueue = [];
  this.tick = options.tick || defaultTick;
  this._id = options._id || 2;
}

protoclass(RunLoop, {

  /**
   * child runloop in-case we get into recursive loops
   */

  child: function() {
    return this.__child || (this.__child = new RunLoop({ tick: this.tick, _id: this._id << 2 }));
  },

  /**
   * Runs animatable object on requestAnimationFrame. This gets
   * called whenever the UI state changes.
   *
   * @method animate
   * @param {Object} animatable object. Must have `update()`
   */

  deferOnce: function(context) {

    if (!context.__running) context.__running = 1;

    if (context.__running & this._id) {
      if (this._running) {
        this.child().deferOnce(context);
      }
      return;
    }

    context.__running |= this._id;

    // push on the animatable object
    this._animationQueue.push(context);

    // if animating, don't continue
    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    // run the animation frame, and callback all the animatable objects
    this.tick(function() {
      self.runNow();
      self._requestingFrame = false;
    });
  },

  /**
   */

  runNow: function() {
    var queue = this._animationQueue;
    this._animationQueue = [];
    this._running = true;

    // queue.length is important here, because animate() can be
    // called again immediately after an update
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      item.update();
      item.__running &= ~this._id;

      // check for anymore animations - need to run
      // them in order
      if (this._animationQueue.length) {
        this.runNow();
      }
    }

    this._running = false;
  }
});

module.exports = RunLoop;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":77,"protoclass":80}],50:[function(require,module,exports){

// TODO: refactor me

/**
 */

function boundScript(script) {

  var run  = script.run;
  var refs = script.refs;

  return {
    refs: refs,
    evaluate: function(view) {
      return run.call(view);
    },
    watch: function(view, listener) {

      var currentValue;
      var locked = false;

      function now() {
        if (locked) return this;
        locked = true;
        var oldValue = currentValue;
        listener(currentValue = run.call(view), oldValue);
        locked = false;
        return this;
      }

      var dispose;

      if (!refs.length) return {
        dispose: function() {},
        trigger: now
      };

      if (refs.length === 1) {
        dispose = view.watch(refs[0], now).dispose;
      } else {

        var bindings = [];

        for (var i = refs.length; i--;) {
          bindings.push(view.watch(refs[i], now));
        }

        dispose = function() {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        };
      }

      return {
        dispose: dispose,
        trigger: function() {
          now();
          return this;
        }
      };
    }
  };
}

/**
 * scripts combined with strings. defined within attributes usually
 */

function bufferedScript(values, view) {

  var scripts = values.filter(function(value) {
    return typeof value !== "string";
  }).map(function(script) {
    return script;
  });

  function evaluate(view) {
    return values.map(function(script) {

      if (typeof script === "string") {
        return script;
      }

      return script.run.call(view);

    }).join("");
  }

  return {
    buffered: true,
    evaluate: function(view) {
      return evaluate(view);
    },
    watch: function(view, listener) {

      var bindings = [];

      function now() {
        listener(evaluate(view));
        return this;
      }

      for (var i = scripts.length; i--;) {

        var script = scripts[i];
        if (!script.refs) continue;

        for (var j = script.refs.length; j--;) {
          var ref = script.refs[j];

          bindings.push(view.watch(ref, now));
        }
      }

      return {
        trigger: now,
        dispose: function() {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      };
    }
  };
}

/**
 */

function staticScript(value, view) {
  return {
    watch: function(view, listener) {
      return {
        trigger: function() {
          listener(value);
          return this;
        },
        dispose: function() {

        }
      };
    }
  };
}

/**
 */

module.exports = function(value) {

  if (typeof value !== "object") return staticScript(value);
  if (value.length) {
    if (value.length === 1) return boundScript(value[0].value);
    return bufferedScript(value.map(function(v) {
      if (typeof v === "object") return v.value;
      return v;
    }));
  } else {
    return boundScript(value);
  }
};

},{}],51:[function(require,module,exports){
var DocumentSection = require("document-section").Section;
var protoclass      = require("protoclass");
var utils           = require("../utils");

/**
 */

function FragmentSection(document, start, end) {
  DocumentSection.call(this, document, start, end);
}

/**
 */

DocumentSection.extend(FragmentSection, {

  /**
   */

  rootNode: function() {
    return this.start.parentNode;
  },

  /**
   */

  createMarker: function() {
    return new Marker(this.document, utils.getNodePath(this.start), utils.getNodePath(this.end));
  },

  /**
   */

  clone: function() {
    var clone = DocumentSection.prototype.clone.call(this);
    return new FragmentSection(this.document, clone.start, clone.end);
  }
});

/**
 */

function Marker(document, startPath, endPath) {
  this.document = document;
  this.startPath   = startPath;
  this.endPath     = endPath;
}

/**
 */

protoclass(Marker, {

  /**
   */

  getSection: function(rootNode) {

    var start = utils.getNodeByPath(rootNode, this.startPath);
    var end   = utils.getNodeByPath(rootNode, this.endPath);

    return new FragmentSection(this.document, start, end);
  }
});

module.exports = FragmentSection;

},{"../utils":73,"document-section":78,"protoclass":80}],52:[function(require,module,exports){
var DocumentSection = require("document-section").Section;
var protoclass      = require("protoclass");
var utils           = require("../utils");

/**
 */

function NodeSection(document, node, _rnode) {
  this.node = node;
  this.document = document;
}

/**
 */

protoclass(NodeSection, {

  /**
   */

  rootNode: function() {
    return this.node;
  },

  /**
   */

  createMarker: function() {
    return new Marker(this.document, utils.getNodePath(this.node));
  },

  /**
   */

  appendChild: function(child) {
    this.node.appendChild(child);
  },

  /**
   */

  removeAll: function() {
    this.node.innerHTML = "";
  },

  /**
   */

  render: function() {
    return this.node;
  },

  /**
   */

  remove: function() {
    if (this.node.parentNode) this.node.parentNode.removeChild(this.node);
  },

  /**
   */

  clone: function() {
    return new NodeSection(this.document, this.node.cloneNode(true));
  }
});

/**
 */

function Marker(document, nodePath) {
  this.nodePath    = nodePath;
  this.document = document;
}

/**
 */

protoclass(Marker, {

  /**
   */

  getSection: function(rootNode) {
    var start = utils.getNodeByPath(rootNode, this.nodePath);
    return new NodeSection(this.document, start);
  }
});

module.exports = NodeSection;

},{"../utils":73,"document-section":78,"protoclass":80}],53:[function(require,module,exports){
var BaseComponent = require("../components/base");
var _bind         = require("../utils/bind");
var _extend       = require("../utils/extend");

/**
 */

function TemplateComponent(options) {
  BaseComponent.call(this, options);
}

/**
 */

module.exports = BaseComponent.extend(TemplateComponent, {

  /**
   */

  bind: function() {
    this._bindings = [];

    this.childContext = new this.contextClass(this.attributes);

    if (!this.childView) {
      this.childView = this.template.view(this.childContext, {
        parent: this.view
      });
      this.section.appendChild(this.childView.render());
    } else {
      this.childView.setOptions({ parent: this.view });
      this.childView.bind(this.childContext);
    }

    BaseComponent.prototype.bind.call(this);
  },

  /**
   */

  unbind: function() {
    if (this.childView) this.childView.unbind();
  }
});

},{"../components/base":19,"../utils/bind":71,"../utils/extend":72}],54:[function(require,module,exports){
(function (process){
var protoclass        = require("protoclass");
var nofactor          = require("nofactor");
var BlockNode         = require("./vnode/block");
var ElementNode       = require("./vnode/element");
var FragmentNode      = require("./vnode/fragment");
var TextNode          = require("./vnode/text");
var CommentNode       = require("./vnode/comment");
var View              = require("./view");
var FragmentSection   = require("../section/fragment");
var NodeSection       = require("../section/node");
var TemplateComponent = require("./component");
var defaults          = require("../defaults");
var extend            = require("../utils/extend");

/**
 * Compiles the template
 */

var isIE = false;

// check for all versions of IE - IE doesn't properly support
// element.cloneNode(true), so we can't use that optimization.
/* istanbul ignore if */
if (process.browser) {
  var hasMSIE    = ~navigator.userAgent.toLowerCase().indexOf("msie");
  var hasTrident = ~navigator.userAgent.toLowerCase().indexOf("trident");
  isIE = !!(hasMSIE || hasTrident);
}

function Template(script, options) {

  this.options       = options;
  this.accessor      = options.accessor;
  this.useCloneNode  = options.useCloneNode != void 0 ? !!options.useCloneNode : !isIE;
  this.accessorClass = options.accessorClass || defaults.accessorClass;
  this.components    = options.components    || defaults.components;
  this.modifiers     = options.modifiers     || defaults.modifiers;
  this.attributes    = options.attributes    || defaults.attributes;
  this.runloop       = options.runloop       || defaults.runloop;
  this.document      = options.document   || nofactor;

  if (typeof script === "function") {
    this.vnode = script(
      FragmentNode.create,
      BlockNode.create,
      ElementNode.create,
      TextNode.create,
      CommentNode.create,
      void 0,
      this.modifiers
    );
  } else {
    this.vnode = script;
  }

  this._viewPool   = [];

  this.initialize();
}

/**
 */

module.exports = protoclass(Template, {

  /**
   */

  initialize: function() {
    this.hydrators = [];

    // first build the cloneable DOM node
    this.section = new FragmentSection(this.document);

    var node = this.vnode.initialize(this);

    if (node.nodeType === 11) {
      this.section = new FragmentSection(this.document);
      this.section.appendChild(node);
    } else {
      this.section = new NodeSection(this.document, node);
    }

    // next we need to initialize the hydrators - many of them
    // keep track of the path to a particular nodes.
    for (var i = this.hydrators.length; i--;) {
      this.hydrators[i].initialize();
    }
  },

  /**
   */

  createComponentClass: function(contextClass) {
    return TemplateComponent.extend({
      template     : this,
      contextClass : contextClass || Object
    });
  },

  /**
   * Creates a child template with the same options, difference source.
   * This method allows child nodes to have a different context, or the same
   * context of a different template. Used in components.
   */

  child: function(vnode, options) {
    return new Template(vnode, extend(options, {}, this.options));
  },

  /**
   * Creates a new or recycled view which binds a cloned node
   * from the template to a context (or view scope).
   */

  view: function(context, options) {

    var clonedSection;

    /*
      TODO (for IE):

      if (internetExplorer) {
        var clone = this.nodeCreator.createNode();
      } else {
        if (!this._templateNode) this._templateNode = this.nodeCreator.createNode();
        var clone = this._templateNode.clone();
      }
     */

    // re-init for now
    if (!this.useCloneNode) {
      this.initialize();
      clonedSection = this.section;
    } else {
      clonedSection = this.section.clone();
    }

    var view = this._viewPool.pop();

    if (view) {
      view.setOptions(options || {});
    } else {
      view = new View(this, this._viewPool, clonedSection, this.hydrators, options || {});
    }

    view.setOptions(options || {});
    if (context) view.bind(context);
    return view;
  }
});

/**
 */

module.exports = function(source, options) {

  var script;
  var tos = typeof source;

  if (tos === "string") {

    if (!module.exports.parser) {
      throw new Error("paperclip parser does not exist");
    }

    script = module.exports.parser.compile(source);
  } else if (tos === "function") {
    script = source;
  } else {
    throw new Error("source must either be type 'string' or 'function'");
  }

  /**
   * Note: the template used to be cached on the script, but this isn't
   * possible now since components are registered on the template level.
   */

  return new Template(script, options || defaults);
};

}).call(this,require('_process'))
},{"../defaults":25,"../section/fragment":51,"../section/node":52,"../utils/extend":72,"./component":53,"./view":55,"./vnode/block":60,"./vnode/comment":62,"./vnode/element":66,"./vnode/fragment":68,"./vnode/text":69,"_process":77,"nofactor":79,"protoclass":80}],55:[function(require,module,exports){
(function (global){
var protoclass     = require("protoclass");
var Transitions    = require("./transitions");
var _bind          = require("../../utils/bind");
var _stringifyNode = require("../../utils/stringifyNode");
var Reference      = require("./reference");

/**
 * constructor
 * @param template the template which created this view
 * @param pool the pool of views to push back into after
 * this view has been disposed
 * @param section the section (cloned node) to attach to
 * @param hydrators binding hydrators that help tie this view
 * to the section
 */

function View(template, pool, section, hydrators, options) {

  this.template        = template;
  this.section         = section;
  this.bindings        = [];
  this._pool           = pool;
  this.parent          = options.parent;
  this.accessor        = this.parent ? this.parent.accessor : template.accessor || new template.accessorClass();
  this.rootNode        = section.rootNode();
  this.transitions     = new Transitions();
  this.runloop         = template.runloop;
  this._watchers       = [];

  for (var i = 0, n = hydrators.length; i < n; i++) {
    hydrators[i].hydrate(this);
  }

  this._dispose = _bind(this._dispose, this);
}

/**
 */

protoclass(View, {

  /**
   */

  setOptions: function(options) {
    this.parent = options.parent;
    if (options.parent) this.accessor = this.parent.accessor;
  },

  /**
   */

  get: function(path) {
    var v = this.accessor.get(this.context, path);
    return v != null ? v : this.parent ? this.parent.get(path) : void 0;
  },

  /**
   */

  set: function(path, value) {
    return this.accessor.set(this.context, path, value);
  },

  /**
   */

  reference: function(path, settable, gettable) {
    return new Reference(this, path, settable, gettable);
  },

  /**
   */

  call: function(path, params) {
    var has = this.accessor.get(this.context, path);
    return has ? this.accessor.call(this.context, path, params) : this.parent ? this.parent.call(path, params) : void 0;
  },

  /**
   */

  setProperties: function(properties) {
    for (var key in properties) this.set(key, properties[key]);
  },

  /**
   */

  watch: function(keypath, listener) {
    return this.accessor.watchProperty(this.context, keypath, listener);
  },

  /**
   */

  watchEvent: function(object, event, listener) {
    return this.accessor.watchEvent(object, event, listener);
  },

  /**
   */

  bind: function(context) {

    if (this.context) {
      this.unbind();
    }
    if (!context) context = {};

    this.context = this.accessor.castObject(context);

    for (var i = 0, n = this.bindings.length; i < n; i++) {
      this.bindings[i].bind();
    }
  },

  /**
   */

  unbind: function() {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].unbind();
    }

  },

  /**ch
   */

  render: function() {
    if (!this.context) this.bind({});
    this.transitions.enter();
    return this.section.render();
  },

  /**
   */

  remove: function() {
    this.section.remove();
    return this;
  },

  /**
   * disposes the view, and re-adds it to the template pool. At this point, the
   * view cannot be used anymore.
   */

  dispose: function() {
    if (this.transitions.exit(this._dispose)) return;
    this._dispose();
    return this;
  },

  /**
   */

  _dispose: function() {
    this.unbind();
    this.section.remove();
    this._pool.push(this);
  },

  /**
   */

  toString: function() {
    var node = this.render();

    /* istanbul ignore if */
    if (this.template.document === global.document) {
      return _stringifyNode(node);
    }

    return node.toString();
  }
});

module.exports = View;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../utils/bind":71,"../../utils/stringifyNode":75,"./reference":56,"./transitions":57,"protoclass":80}],56:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 */

function Reference(view, path, settable, gettable) {
  this.view     = view;
  this.path     = path;
  this.settable = settable !== false;
  this.gettable = gettable !== false;
}

/**
 */

protoclass(Reference, {

  /**
   */

  __isReference: true,

  /**
   */

  value: function(value) {
    if (!arguments.length) {
      return this.gettable ? this.view.get(this.path) : void 0;
    }
    if (this.settable) this.view.set(this.path, value);
  },

  /**
   */

  toString: function() {
    return this.view.get(this.path);
  }
});

module.exports = Reference;

},{"protoclass":80}],57:[function(require,module,exports){
(function (process){
var protoclass = require("protoclass");
var async      = require("../../utils/async");

/**
 */

function Transitions() {
  this._enter = [];
  this._exit  = [];
}

/**
 */

module.exports = protoclass(Transitions, {

  /**
   */

  push: function(transition) {
    if (transition.enter) this._enter.push(transition);
    if (transition.exit) this._exit.push(transition);
  },

  /**
   */

  enter: function() {
    if (!this._enter.length) return false;
    for (var i = 0, n = this._enter.length; i < n; i++) {
      this._enter[i].enter();
    }
  },

  /**
   */

  exit: function(complete) {
    if (!this._exit.length) return false;
    var self = this;
    process.nextTick(function() {
      async.each(self._exit, function(transition, next) {
        transition.exit(next);
      }, complete);
    });

    return true;
  }
});

}).call(this,require('_process'))
},{"../../utils/async":70,"_process":77,"protoclass":80}],58:[function(require,module,exports){
(function (global){
var protoclass = require("protoclass");
var utils      = require("../../../utils");
var _bind      = require("../../../utils/bind");

/**
 */

function BlockBinding(node, script, view) {
  this.view   = view;
  this.document = view.template.document;
  this.script = script;
  this.node   = node;
  this.didChange = _bind(this.didChange, this);
}

/**
 */

module.exports = protoclass(BlockBinding, {

  /**
   */

  bind: function() {
    var self = this;

    this.binding = this.script.watch(this.view, function(value, oldValue) {
      if (value === self.currentValue) return;
      self.currentValue = value;
      self.didChange();
    });

    this.currentValue = this.script.evaluate(this.view);
    if (this.currentValue != null) this.update();
  },

  /**
   */

  didChange: function() {
    this.view.runloop.deferOnce(this);
  },

  /**
   */

  update: function() {
    var v = String(this.currentValue == null ? "" : this.currentValue);
    if (this.document !== global.document) {
      this.node.replaceText(v, true);
    } else {
      this.node.nodeValue = String(v);
    }
  },

  /**
   */

  unbind: function() {
    if (this.binding) {
      this.binding.dispose();
      this.binding = void 0;
    }
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../utils":73,"../../../utils/bind":71,"protoclass":80}],59:[function(require,module,exports){
var protoclass = require("protoclass");
var utils      = require("../../../utils");
var Binding    = require("./binding");

/**
 */

function BlockHydrator(node, script, bindingClass) {
  this.node   = node;
  this.script = script;
  this.bindingClass = bindingClass;
}

/**
 */

module.exports = protoclass(BlockHydrator, {

  /**
   */

  initialize: function() {
    this.nodePath = utils.getNodePath(this.node);
  },

  /**
   */

  hydrate: function(view) {
    var clonedNode = utils.getNodeByPath(view.rootNode, this.nodePath);
    view.bindings.push(new this.bindingClass(clonedNode, this.script, view));
  }
});

},{"../../../utils":73,"./binding":58,"protoclass":80}],60:[function(require,module,exports){
var protoclass = require("protoclass");
var utils      = require("../../../utils");
var script     = require("../../../script");
var Hydrator   = require("./hydrator");
var Binding    = require("./binding");
var Unbound    = require("./unbound");

/**
 */

function Block(scriptSource) {
  this.script  = script(scriptSource);
}

/**
 */

module.exports = protoclass(Block, {

  /**
   */

  initialize: function(template) {
    var node = template.document.createTextNode("");
    var bindingClass = this.script.refs.length ? Binding : Unbound;
    template.hydrators.push(new Hydrator(node, this.script, bindingClass));
    return node;
  }
});

/**
 */

module.exports.create = function(script) {
  return new Block(script);
};

},{"../../../script":50,"../../../utils":73,"./binding":58,"./hydrator":59,"./unbound":61,"protoclass":80}],61:[function(require,module,exports){
(function (global){
var protoclass = require("protoclass");
var utils      = require("../../../utils");

/**
 */

function UnboundBlockBinding(node, script, view) {
  this.view   = view;
  this.document = view.template.document;
  this.script = script;
  this.node   = node;
}

/**
 */

module.exports = protoclass(UnboundBlockBinding, {

  /**
   */

  bind: function() {
    var self = this;
    var value = this.script.evaluate(this.view);
    if (this.value === value) return;
    this.value = value;

    var v = String(value == null ? "" : value);

    if (this.document !== global.document) {
      this.node.replaceText(v, true);
    } else {
      this.node.nodeValue = String(v);
    }
  },

  /**
   */

  unbind: function() { }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../utils":73,"protoclass":80}],62:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 */

function Comment(value) {
  this.value    = value;
}

/**
 */

module.exports = protoclass(Comment, {

  /**
   */

  initialize: function(template) {
    return template.document.createComment(this.value);
  }
});

/**
 */

module.exports.create = function(value) {
  return new Comment(value);
};

},{"protoclass":80}],63:[function(require,module,exports){
var protoclass        = require("protoclass");
var utils             = require("../../../utils");
var AttributesBinding = require("./attributesBinding");

/**
 */

function AttributeHydrator(attrClass, key, value, node) {
  this.node      = node;
  this.key       = key;
  this.value     = value;
  this.attrClass = attrClass;
}

/**
 */

module.exports = protoclass(AttributeHydrator, {

  /**
   */

  initialize: function() {
    this.nodePath = utils.getNodePath(this.node);
  },

  /**
   */

  hydrate: function(view) {

    var attribute = new this.attrClass({

      // attribute handlers can only be added to real elements for now since
      // components can have any number of dynamic text/element children - which won't
      // have attribute handlers attached to them such as onClick, onEnter, etc.
      node: utils.getNodeByPath(view.rootNode, this.nodePath),
      view: view,
      key: this.key,
      value: this.value
    });

    view.bindings.push(attribute);
  }
});

},{"../../../utils":73,"./attributesBinding":64,"protoclass":80}],64:[function(require,module,exports){
var protoclass = require("protoclass");
var utils      = require("../../../utils");

/**
 */

function AttributesBinding(attributes, rawAttributes, component, view) {
  this.attributes    = attributes;
  this.rawAttributes = rawAttributes;
  this.component     = component;
  this.view          = view;
}

/**
 */

module.exports = protoclass(AttributesBinding, {

  /**
   */

  bind: function() {
    this.bindings = [];
    for (var k in this.rawAttributes) {
      var v = this.rawAttributes[k];
      if (v.watch && v.evaluate) {
        this._bindAttr(k, v);
      } else {
        this.attributes[k] = v;
      }
    }
  },

  /**
   */

  _bindAttr: function(k, v) {
    var self = this;

    this.bindings.push(v.watch(this.view, function(nv, ov) {
      self.attributes[k] = nv;
      self.view.runloop.deferOnce(self.component);
    }));

    self.attributes[k] = v.evaluate(this.view);

  },

  /**
   */

  unbind: function() {
    if (!this.bindings) return;
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].dispose();
    }
    this.bindings = [];
  }
});

},{"../../../utils":73,"protoclass":80}],65:[function(require,module,exports){
var protoclass        = require("protoclass");
var AttributesBinding = require("./attributesBinding");
var _extend           = require("../../../utils/extend");

/**
 */

function ComponentHydrator(name, attributes, childTemplate, section, componentClass) {
  this.name           = name;
  this.attributes     = attributes;
  this.childTemplate  = childTemplate;
  this.section        = section;
  this.componentClass = componentClass;
}

/**
 */

module.exports = protoclass(ComponentHydrator, {

  /**
   */

  initialize: function() {
    this.sectionMarker = this.section.createMarker();
  },

  /**
   */

  hydrate: function(view) {
    this.childTemplate.accessor = view.accessor;

    var clonedSection = this.sectionMarker.getSection(view.rootNode);

    // TODO - bind script attrs to these attrs
    var attributes = _extend({}, this.attributes);

    var component = new this.componentClass({
      name          : this.name,
      section       : clonedSection,
      attributes    : attributes,
      view          : view,
      childTemplate : this.childTemplate
    });

    view.bindings.push(new AttributesBinding(attributes, this.attributes, component, view));

    // is it bindable?
    if (component.bind) view.bindings.push(component);
  }
});

},{"../../../utils/extend":72,"./attributesBinding":64,"protoclass":80}],66:[function(require,module,exports){
var protoclass        = require("protoclass");
var FragmentSection   = require("../../../section/fragment");
var NodeSection       = require("../../../section/node");
var Fragment          = require("../fragment");
var utils             = require("../../../utils");
var script            = require("../../../script");
var ComponentHydrator = require("./componentHydrator");
var AttributeHydrator = require("./attributeHydrator");
var ValueAttribute    = require("./valueAttribute");
var _set              = require("../../../utils/set");

/**
 */

function _replaceDashes(k) {
  return k.replace(/\-./, function(k) {
    return k.substr(1).toUpperCase();
  });
}

/**
 */

function Element(name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children;
}

/**
 */

module.exports = protoclass(Element, {

  /**
   */

  initialize: function(template) {

    var ccName = _replaceDashes(this.name);

    var componentClass = template.components[ccName];

    // is a component present?
    if (componentClass) {

      // create a dynamic section - this is owned by the component
      var section = new FragmentSection(template.document);

      template.hydrators.push(new ComponentHydrator(
        ccName,
        this.attributes,
        template.child(this.children),
        section,
        componentClass
      ));

      // TODO:

      /*
        return {
          createNode: function() {
            return section.render();
          }
        }
      */

      return section.render();
    }

    var element          = template.document.createElement(this.name);
    var hasAttrComponent = false;
    var vanillaAttrs     = {};
    var elementSection;
    var v;

    // components should be attachable to regular DOM elements as well
    for (var k in this.attributes) {

      var k2                 = _replaceDashes(k);
      v                      = this.attributes[k];
      var tov                = typeof v;
      var attrComponentClass = template.components[k2];
      var attrClass          = template.attributes[k2];

      hasAttrComponent = !!attrComponentClass || hasAttrComponent;

      if (attrComponentClass) {

        // TODO - element might need to be a sub view
        if (!elementSection) {
          elementSection = new NodeSection(template.document, element);
        }

        template.hydrators.push(new ComponentHydrator(
          this.name,

          // v could be formatted as repeat.each, repeat.as. Need to check for this
          typeof v === "object" ? v : this.attributes,
          template.child(this.children),
          elementSection,
          attrComponentClass
        ));

      } else if (attrClass && (!attrClass.test || attrClass.test(v))) {
        template.hydrators.push(new AttributeHydrator(
          attrClass,
          k,
          v,
          element
        ));
      } else {

        if (tov !== "object") {
          vanillaAttrs[k] = v;
        } else {
          template.hydrators.push(new AttributeHydrator(
            ValueAttribute,
            k,
            v,
            element
          ));
        }
      }
    }

    /*
      TODO: throw node creation in another object

      return {
        createNode: function() {

          var element = document.createElement()
          // no component class with the attrs? append the children
          if (!hasAttrComponent) element.appendChild(this.children.initialize(template));

          return element;
        }
      }
    */

    for (k in vanillaAttrs) {
      v = vanillaAttrs[k];
      if (typeof v !== "object") {
        element.setAttribute(k, vanillaAttrs[k]);
      }
    }

    // no component class with the attrs? append the children
    if (!hasAttrComponent) element.appendChild(this.children.initialize(template));

    return element;
  }
});

module.exports.create = function(name, attributes, children) {

  // check the attributes for any scripts - pluck them out
  // TODO - check for attribute components - apply the same
  // logic as components

  var attrs = {};

  // NOTE - a bit sloppy here, but we're hijacking the bindable object
  // setter functionality so we can properly get attrs for stuff like repeat.each
  for (var k in attributes) {
    var v = attributes[k];
    _set(attrs, k.toLowerCase(), typeof v === "object" ? script(v) : v);
  }

  // TODO - check for registered components,
  return new Element(name, attrs, new Fragment(children));
};

},{"../../../script":50,"../../../section/fragment":51,"../../../section/node":52,"../../../utils":73,"../../../utils/set":74,"../fragment":68,"./attributeHydrator":63,"./componentHydrator":65,"./valueAttribute":67,"protoclass":80}],67:[function(require,module,exports){
var ScriptAttribute = require("../../../attributes/script");

/**
 */

module.exports = ScriptAttribute.extend({

  /**
   */

  update: function() {
    if (this.currentValue == null) return this.node.removeAttribute(this.key);
    this.node.setAttribute(this.key, this.currentValue);
  }
});

},{"../../../attributes/script":16}],68:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 */

function Fragment(children) {
  this.children = children;
}

/**
 */

module.exports = protoclass(Fragment, {

  /**
   */

  initialize: function(template) {
    if (this.children.length === 1) return this.children[0].initialize(template);
    var frag = template.document.createDocumentFragment();
    this.children.forEach(function(child) {
      frag.appendChild(child.initialize(template));
    });
    return frag;
  }
});

/**
 */

module.exports.create = function(children) {
  return new Fragment(children);
};

},{"protoclass":80}],69:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 */

function Text(value) {
  this.value = value;
}

/**
 */

module.exports = protoclass(Text, {

  /**
   */

  initialize: function(template) {

    // blank text nodes are NOT allowed. Chrome has an issue rendering
    // blank text nodes - way, WAY slower if this isn't here!
    if (/^\s+$/.test(this.value)) {
      return template.document.createTextNode("\u00A0");
    }

    return template.document.createTextNode(this.value);
  }
});

/**
 */

module.exports.create = function(value) {
  return new Text(value);
};

},{"protoclass":80}],70:[function(require,module,exports){
module.exports = {

  /**
   */

  each: function(items, each, complete) {

    var total     = items.length;
    var completed = 0;

    items.forEach(function(item) {
      var called = false;
      each(item, function() {
        if (called) throw new Error("callback called twice");
        called = true;
        if (++completed === total && complete) complete();
      });
    });
  }
};

},{}],71:[function(require,module,exports){
module.exports = function(callback, context) {
  if (callback.bind) return callback.bind.apply(callback, [context].concat(Array.prototype.slice.call(arguments, 2)));
  return function() {
    return callback.apply(context, arguments);
  };
};

},{}],72:[function(require,module,exports){
module.exports = function(to) {
  if (!to) to = {};
  var froms = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, n = froms.length; i < n; i++) {
    var from = froms[i];
    for (var key in from) {
      to[key] = from[key];
    }
  }
  return to;
};

},{}],73:[function(require,module,exports){
var createDocumentSection = require("document-section");

module.exports = {
  getNodePath: function(node) {

    var path = [];
    var p    = node.parentNode;
    var c    = node;

    while (p) {

      // need to slice since some browsers don't support indexOf for child nodes
      path.unshift(Array.prototype.slice.call(p.childNodes).indexOf(c));
      c = p;
      p = p.parentNode;
    }

    return path;
  },
  getNodeByPath: function(node, path) {

    var c = node;

    for (var i = 0, n = path.length; i < n; i++) {
      c = c.childNodes[path[i]];
    }

    return c;
  }
};

},{"document-section":78}],74:[function(require,module,exports){
module.exports = function(target, keypath, value) {

  var keys = typeof keypath === "string" ? keypath.split(".") : keypath;
  var ct   = target;
  var key;

  for (var i = 0, n = keys.length - 1; i < n; i++) {
    key = keys[i];
    if (!ct[key]) {
      ct[key] = {};
    }
    ct = ct[key];
  }

  ct[keys[keys.length - 1]] = value;
  return value;
};

},{}],75:[function(require,module,exports){
/* istanbul ignore next */
function _stringifyNode(node) {

  var buffer = "";

  if (node.nodeType === 11) {
    for (var i = 0, n = node.childNodes.length; i < n; i++) {
      buffer += _stringifyNode(node.childNodes[i]);
    }
    return buffer;
  }

  buffer = node.nodeValue || node.outerHTML || "";

  if (node.nodeType === 8) {
    buffer = "<!--" + buffer + "-->";
  }

  return buffer;
}

module.exports = _stringifyNode;

},{}],76:[function(require,module,exports){
module.exports = function(ary) {

  var occurences = {};
  var clone      = ary.concat();

  for (var i = clone.length; i--;) {
    var item = clone[i];
    if (!occurences[item]) occurences[item] = 0;

    if (++occurences[item] > 1) {
      clone.splice(i, 1);
    }
  }

  return clone;
};

},{}],77:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],78:[function(require,module,exports){
var protoclass  = require("protoclass"),
defaultDocument = require("nofactor");

// TODO - figure out a way to create a document fragment in the constructor
// instead of calling toFragment() each time. perhaps
var Section = function (document, start, end) {

  this.document = document = document || defaultDocument;

  // create invisible markers so we know where the sections are

  this.start       = start || document.createTextNode("");
  this.end         = end   || document.createTextNode("");
  this.visible     = true;

  if (!this.start.parentNode) {
    var parent  = document.createDocumentFragment();
    parent.appendChild(this.start);
    parent.appendChild(this.end);
  }
};


Section = protoclass(Section, {

  /**
   */

  __isLoafSection: true,

  /**
   */

  render: function () {
    return this.start.parentNode;
  },

  /**
   */

  clone: function () {

    var parentClone;

    // fragment?
    if (this.start.parentNode.nodeType === 11) {
      parentClone = this.start.parentNode.cloneNode(true);
    } else {
      parentClone = this.document.createDocumentFragment();

      this.getChildNodes().forEach(function (node) {
        parentClone.appendChild(node.cloneNode(true));
      });
    }

    return new Section(this.document, parentClone.childNodes[0], parentClone.childNodes[parentClone.childNodes.length - 1 ]);
  },

  /**
   */

  remove: function () {
    // this removes the child nodes completely
    return this._createFragment(this.getChildNodes());
  },

  /**
   */

  _createFragment: function(nodes) {
    var fragment = this.document.createDocumentFragment();
    nodes.forEach(function(node) {
      fragment.appendChild(node);
    });
    return fragment;
  },

  /**
   * shows the section
   */


  show: function () {
    if(!this._detached) return this;
    this.append.apply(this, this._detached.getInnerChildNodes());
    this._detached = void 0;
    this.visible = true;
    return this;
  },

  /**
   * hides the fragment, but maintains the start / end elements
   * so it can be shown again in the same spot.
   */

  hide: function () {
    this._detached = this.removeAll();
    this.visible = false;
    return this;
  },

  /**
   */

  removeAll: function () {
    return this._section(this._removeAll());
  },

  /**
   */

  _removeAll: function () {

    var start = this.start,
    end       = this.end,
    current   = start.nextSibling,
    children  = [];

    while (current != end) {
      current.parentNode.removeChild(current);
      children.push(current);
      current = this.start.nextSibling;
    }

    return children;
  },


  /**
   * DEPRECATED - use appendChild
   */

  append: function () {

    var newNodes = Array.prototype.slice.call(arguments);

    if (!newNodes.length) return;

    if(newNodes.length > 1) {
      newNodes = this._createFragment(newNodes);
    } else {
      newNodes = newNodes[0];
    }

    this.end.parentNode.insertBefore(newNodes, this.end);
  },

  /**
   */

  appendChild: function () {
    this.append.apply(this, arguments);
  },

  /**
   * DEPRECATED - use prependChild
   */

  prepend: function () {
    var newNodes = Array.prototype.slice.call(arguments);

    if (!newNodes.length) return;

    if(newNodes.length > 1) {
      newNodes = this._createFragment(newNodes);
    } else {
      newNodes = newNodes[0];
    }

    this.start.parentNode.insertBefore(newNodes, this.start.nextSibling);
  },


  /**
   */

  prependChild: function () {
    this.prepend.apply(this, arguments);
  },


  /**
   */

  replaceChildNodes: function () {

    //remove the children - children should have a parent though
    this.removeAll();
    this.append.apply(this, arguments);
  },

  /**
   */

  toString: function () {
    var buffer = this.getChildNodes().map(function (node) {
      return node.outerHTML || (node.nodeValue != undefined && node.nodeType == 3 ? node.nodeValue : String(node));
    });
    return buffer.join("");
  },

  /**
   */

  dispose: function () {
    if(this._disposed) return;
    this._disposed = true;

    // might have sub sections, so need to remove with a parent node
    this.removeAll();
    this.start.parentNode.removeChild(this.start);
    this.end.parentNode.removeChild(this.end);
  },

  /**
   */

  getChildNodes: function () {
    var cn   = this.start,
    end      = this.end.nextSibling,
    children = [];


    while (cn != end) {
      children.push(cn);
      cn = cn.nextSibling;
    }

    return children;
  },

  /**
   */

  getInnerChildNodes: function () {
    var cn = this.getChildNodes();
    cn.shift();
    cn.pop()
    return cn;
  },


  /**
   */

  _section: function (children) {
    var section = new Section(this.document);
    section.append.apply(section, children);
    return section;
  }
});

module.exports = function (document, start, end)  {
  return new Section(document, start, end);
}

module.exports.Section = Section;

},{"nofactor":79,"protoclass":80}],79:[function(require,module,exports){
module.exports = document;

},{}],80:[function(require,module,exports){
function _copy (to, from) {

  for (var i = 0, n = from.length; i < n; i++) {

    var target = from[i];

    for (var property in target) {
      to[property] = target[property];
    }
  }

  return to;
}

function protoclass (parent, child) {

  var mixins = Array.prototype.slice.call(arguments, 2);

  if (typeof child !== "function") {
    if(child) mixins.unshift(child); // constructor is a mixin
    child   = parent;
    parent  = function() { };
  }

  _copy(child, parent); 

  function ctor () {
    this.constructor = child;
  }

  ctor.prototype  = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  child.parent    = child.superclass = parent;

  _copy(child.prototype, mixins);

  protoclass.setup(child);

  return child;
}

protoclass.setup = function (child) {


  if (!child.extend) {
    child.extend = function(constructor) {

      var args = Array.prototype.slice.call(arguments, 0);

      if (typeof constructor !== "function") {
        args.unshift(constructor = function () {
          constructor.parent.apply(this, arguments);
        });
      }

      return protoclass.apply(this, [this].concat(args));
    }

    child.mixin = function(proto) {
      _copy(this.prototype, arguments);
    }

    child.create = function () {
      var obj = Object.create(child.prototype);
      child.apply(obj, arguments);
      return obj;
    }
  }

  return child;
}


module.exports = protoclass;
},{}]},{},[1]);
