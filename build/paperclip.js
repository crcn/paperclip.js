(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require("./paper");

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}
},{"./paper":35}],2:[function(require,module,exports){
var bindable = require("bindable"),
Clip         = require("./index"),
_            = require("underscore"),
protoclass   = require("protoclass");


function ClippedBufferPart (clippedBuffer, script) {

  this.clippedBuffer = clippedBuffer;

  this.clip = new Clip({
    script      : script,
    application : clippedBuffer.application
  });

  this.clip.bind("value", _.bind(this._onUpdated, this));
}

protoclass(ClippedBufferPart, {

  /**
   */

  dispose: function () {
    this.clip.dispose();
  },

  /**
   */

  update: function () {
    this.clip.reset(this.clippedBuffer._data);
    this.clip.update();
    this.value = this.clip.get("value");
  },

  /**
   */

  _onUpdated: function (value) {
    this.value = value;
    if (this.clippedBuffer._updating) return;
    this.clippedBuffer.update();
  }
});


function ClippedBuffer (buffer, application) {
  bindable.Object.call(this, this);

  var self = this;
  this.application = application;

  this.bindings = [];
  this._data    = {};

  this.buffer   = buffer.map(function (part) {

    var ret;

    if (part.fn) {
      ret = new ClippedBufferPart(self, part);
      self.bindings.push(ret);
      return ret;
    } else {
      return { value: part };
    };
  });

}

bindable.Object.extend(ClippedBuffer, {

  /**
   */

  reset: function (data) {
    this._data = data;
    this.update();
    return this;
  },

  /**
   */

  dispose: function () {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].dispose();
    }
    this.bindings = [];
  },

  /**
   */

  update: function () {
    this._updating = true;
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].update();
    }
    this._updating = false;
    this.set("value", this._getText());
  },

  /**
   */

  _getText: function () {

    var buffer = "";

    for (var i = 0, n = this.buffer.length; i < n; i++) {
      var v = this.buffer[i].value;
      buffer += v != null ? v : "";
    }


    return buffer;
  }
});

module.exports = ClippedBuffer;
},{"./index":3,"bindable":47,"protoclass":64,"underscore":66}],3:[function(require,module,exports){
(function (process){
var protoclass = require("protoclass"),
dref           = require("dref"),
bindable       = require("bindable"),
BindableObject = bindable.Object,
type           = require("type-component"),
_              = require("underscore");


function ClipScript (script, name, clip) {
  this.script    = script;
  this.name      = name;
  this.clip      = clip;
  this.application = clip.application;
  this._bindings = [];
  this.refs      = this.script.refs || [];
}


protoclass(ClipScript, {

  /**
   */

  dispose: function () {

    // destroys all the bindings for this clip script
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].dispose();
    }

    this._bindings = [];
    this.__context = undefined;
  },

  /**
   */

  update: function () {

    if (this._locked) return;
    
    // remove all the bindings, and re-initialize. Note that 
    // we're optimizing for initialization, not change, since the
    // greatest overhead is on start.
    if (this.__context) this.dispose();

    // assign the context - this is optimal
    this.__context = this.clip.data;

    // NOTE - watchRefs is usually after script fn, but there are
    // some cases where a value might be set once 'watching' is emitted, so
    // this needs to come BEFORE script.fn.call
    if (this.__context && this.__watch) this._watchRefs();

    this._locked = true;
    // call the translated script
    var newValue = this.script.fn.call(this);
    this._locked = false;


    if (newValue === this.value) {
      return;
    }

    this.clip.set(this.name, this.value = newValue);
  },

  /**
   */

  get: function (path) {
    return this.__context.get(path);
  },

  /**
   */

  set: function (path, value) {
    return this.__context.set(path, value);
  },

  /**
   */

  call: function (ctx, key, params) {

    var fn;

    if (ctx.__isBindable) {
      fn = ctx.get(key);
      ctx = ctx.context();
    } else {
      fn = ctx[key];
    }

    if (fn) return fn.apply(ctx, params);
  },

  /**
   */

  watch: function () {
    this.__watch = true;
    return this;
  },

  /**
   */

  unwatch: function () {
    this.__watch = false;
    this.dispose();
    return this;
  },

  /**
   */

  _watchRefs: function () {

    if (!this._boundWatchRef) {
      this._boundWatchRef = true;
      this._watchRef = _.bind(this._watchRef, this);
    }

    for (var i = this.refs.length; i--;) {
      this._watchRef(this.refs[i]);
    }
  },

  /**
   */

  _watchRef: function (path) {

    var self = this, bindableBinding, locked = true;

    this._bindings.push(this.__context.bind(path, function (value, oldValue) {

      if (bindableBinding) {
        bindableBinding.dispose();
        bindableBinding = undefined;
        self._bindings.splice(self._bindings.indexOf(bindableBinding), 1);
      }

      if (value && value.__isBindable) {
        self._bindings.push(bindableBinding = self._watchBindable(value, oldValue));
      }

      if (!locked && !self._locked) {
        self.dispose();
        self.application.animate(self);
      }
    }).now());

    locked = false;
  },

  /**
   */

  _watchBindable: function (value, oldValue) {
    var onChange, self = this;

    value.on("change", onChange = function () {
      if (!self.__watch) return;
      self._debounceUpdate();
    });

    return {
      dispose: function () {
        value.off("change", onChange);
      }
    }
  },

  /**
   */

  _debounceUpdate: function () {
    if (!process.browser) {
      return this.update();
    }
    if(this._debounceTimeout) clearTimeout(this._debounceTimeout);
    var self = this;
    this._debounceTimeout = setTimeout(function () {
      self.update();
    }, 0);
  }
});

/**
 */

function ClipScripts (clip, scripts) {
    this.clip     = clip;
    this._scripts = {};
    this.names    = [];
    this._bindScripts(scripts);
}

protoclass(ClipScripts, {

  /**
   */

  watch: function () {
    for(var key in this._scripts) {
      this._scripts[key].watch();
    }
  },

  /**
   */

  unwatch: function () {
    for(var key in this._scripts) {
      this._scripts[key].unwatch();
    }
  },

  /**
   */

  update: function () {
    for(var key in this._scripts) {
      this._scripts[key].update();
    }
  },

  /**
   */

  dispose: function () {
    for(var key in this._scripts) {
      this._scripts[key].dispose();
    }
  },

  /**
   */

  get: function (name) {
    return this._scripts[name];
  },

  /**
   */

  _bindScripts: function (scripts) {
    if (scripts.fn) {
      this._bindScript("value", scripts);
    } else {
      for (var scriptName in scripts) {
        this._bindScript(scriptName, scripts[scriptName]);
      }
    }
  },

  /**
   */

  _bindScript: function (name, script, watch) {
    this.names.push(name);
    var clipScript = this._scripts[name] = new ClipScript(script, name, this.clip),
    self = this;
  }
});


function Clip (options) {
  BindableObject.call(this);

  if (options.data) {
    this.reset(options.data, false);
  }

  this.application = options.application;
  this.scripts = new ClipScripts(this, options.scripts || options.script);

  if (options.watch !== false) {
    this.watch();
  }
}

protoclass(BindableObject, Clip, {

  /**
   */

  reset: function (data, update) {
    this.data = data ? data : new bindable.Object();
    if (update !== false) {
      this.update();
    }
  },

  /**
   */

  watch: function () {
    this.scripts.watch();
    return this;
  },

  /**
   */

  unwatch: function () {
    this.scripts.unwatch();
    return this;
  },

  /**
   */

  update: function () {
    this.scripts.update();
    return this;
  },

  /**
   */

  dispose: function () {
    this.scripts.dispose();
  },

  /**
   */

  script: function (name) {
    return this.scripts.get(name);
  }
});

module.exports = Clip;
}).call(this,require("/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":56,"bindable":47,"dref":57,"protoclass":64,"type-component":65,"underscore":66}],4:[function(require,module,exports){
(function (process){
var protoclass = require("protoclass"),
nofactor       = require("nofactor");

function PaperclipApplication () {
  this.nodeFactory = nofactor["default"];
  this._animationQueue = [];
}

protoclass(PaperclipApplication, {

  /**
   */

  animate: function (animatable) {

    if (!process.browser) {
      return animatable.update();
    }

    this._animationQueue.push(animatable);

    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    requestAnimationFrame(function () {

      for (var i = 0; i < self._animationQueue.length; i++) {
        self._animationQueue[i].update();
      }

      self._animationQueue = [];
      self._requestingFrame = false;
    });
  }
});

module.exports = PaperclipApplication;
}).call(this,require("/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":56,"nofactor":62,"protoclass":64}],5:[function(require,module,exports){
var protoclass = require("protoclass");

function PaperBinding (template, node, bindings, section, nodeFactory) {
  this.template    = template;
  this.node        = node;
  this.bindings    = bindings;
  this.section     = section;
  this.nodeFactory = nodeFactory;
}


protoclass(PaperBinding, {

  /**
   */

  remove: function () {
    this.section.remove();
    return this;
  },

  /**
   */

  removeAllNodes: function () {
    this.section.removeAll();
  },

  /**
   */

  dispose: function () {
    this.unbind();
    this.section.remove();
    return this;
  },

  /**
   */

  bind: function (context) {

    if (context) {
      this.context = context;
    }

    this.bindings.bind(this.context);
    return this;
  },

  /**
   */

  unbind: function () {
    this.bindings.unbind();
    return this;
  },

  /**
   */

  render: function () {
    return this.section.show().render();
  },

  /**
   */

  toString: function () {

    if (this.nodeFactory.name === "string") {
      return this.section.toString();
    }

    var frag = this.section.render();

    var div = document.createElement("div");
    div.appendChild(frag.cloneNode(true));
    return div.innerHTML;

  }
});

module.exports = PaperBinding;
},{"protoclass":64}],6:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseBinder (options) {
  this.marker      = options.marker;
  this.application = options.application;
}

protoclass(BaseBinder, {

  /**
   */

  init: function () {
    this._findPathToMarker();
  },

  /**
   */

  getBinding: function (node) {

  },

  /**
   */

  _findMark: function (node) {

    var cn = node;

    while (cn.parentNode) {
      cn = cn.parentNode;
    }

    for (var i = 0, n = this.pathLength; i < n; i++) {
      cn = cn.childNodes[this.path[i]];
    }

    return cn;
  },

  /**
   */

  _findPathToMarker: function () {
    var path = [], 
    marker = this.marker,
    cn = marker;

    while (cn.parentNode) {
      var children = [];

      for (var i = 0, n = cn.parentNode.childNodes.length; i < n; i++) {
        children.push(cn.parentNode.childNodes[i]);
      }

      path.unshift(children.indexOf(cn));

      cn = cn.parentNode;
    }

    this.path = path;
    this.pathLength = path.length;
  }
});

module.exports = BaseBinder;
},{"protoclass":64}],7:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseBinding (node) {
  this.node = node;
}

protoclass(BaseBinding, {
  bind: function (context) { 
    this.context = context;
  },
  unbind: function () {

  }
});

module.exports = BaseBinding;
},{"protoclass":64}],8:[function(require,module,exports){
var protoclass = require("protoclass"),
BaseBinding    = require("./binding");


function ScriptBinding (application, clip, scriptName) {
  this.application = application;
  this.clip        = clip;
  this.scriptName  = scriptName;
  this.script      = clip.script(scriptName);
}


protoclass(BaseBinding, ScriptBinding, {

  /**
   */

  bind: function (context) {

    if (this.watch !== false) {
      this.script.watch().update();
    }

    var self = this;

    this._binding = this.clip.bind(this.scriptName, function (value, oldValue) {

      self.value    = value;
      self.oldValue = oldValue;

      // defer to request animation frame when updating the DOM. A bit
      // more optimal for browsers
      self.application.animate(self);

    }).now();

    return this;
  },

  /**
   */

  unbind: function () {
    if (this._binding) this._binding.dispose();
    this._binding = undefined;
    return this;
  },

  /**
   */

  update: function () {
    this._onChange(this.value, this.oldValue);
  },

  /**
   * DEPRECATED
   */

  _onChange: function(value, oldValue) {

  }
});


module.exports = ScriptBinding;
},{"./binding":7,"protoclass":64}],9:[function(require,module,exports){
var BaseBinding   = require("./base/binding"),
BindingCollection = require("./collection");


function BinderCollection (node, source) {
  this.node    = node;
  this._source = source || [];
}

BaseBinding.extend(BinderCollection, {
  push: function () {
    this._source.push.apply(this._source, arguments);
  },
  getBindings: function (node) {

    if (this._source.length === 1) {
      return this._source[0].getBinding(node);
    }

    var bindings = new BindingCollection();
    for (var i = 0; i < this._source.length; i++) {
      bindings.push(this._source[i].getBinding(node));
    }
    return bindings;
  },
  init: function () {
    for (var i = 0, n = this._source.length; i < n; i++) {
      this._source[i].init();
    }
  }
});

module.exports = BinderCollection;

},{"./base/binding":7,"./collection":15}],10:[function(require,module,exports){
var BaseScriptBinding = require("../base/script");

function BaseBlockBinding (options) {

  var clip                = options.clip;
  this.section            = options.section;
  this.application        = options.application;
  this.nodeFactory        = this.application.nodeFactory;
  this.contentTemplate    = options.template;
  this.scriptName         = options.scriptName;
  this.childBlockTemplate = options.childBlockTemplate;

  this.script = clip.script(this.scriptName);

  BaseScriptBinding.call(this, this.application, clip, this.scriptName);
}

BaseScriptBinding.extend(BaseBlockBinding, {

  /**
   */

  bind: function (context) {
    this.context = context;
    this.clip.reset(context, false);
    return BaseScriptBinding.prototype.bind.call(this, context);
  },

  /**
   */

  unbind: function () {
    BaseScriptBinding.prototype.unbind.call(this);
    return this.clip.unwatch();
  },

  /**
   */

  test: function (node) {
    return false;
  }
});

module.exports = BaseBlockBinding;

},{"../base/script":8}],11:[function(require,module,exports){
/*

{{#when:condition}}
  do something
{{/}}
 */

var BaseBlockBinding = require("./base");

function ConditionalBlockBinding () {
  BaseBlockBinding.apply(this, arguments);
}

BaseBlockBinding.extend(ConditionalBlockBinding, {
  _onChange: function (value, oldValue) {

    var child = this.child;

    if (child) {
      child.unbind();
      this.child = undefined;
    }

    var childTemplate;

    if (value) {
      childTemplate = this.contentTemplate;
    } else {
      childTemplate = this.childBlockTemplate;
    }

    if (childTemplate) {
      this.child = childTemplate.bind(this.context);
      this.section.replaceChildNodes(this.child.render());
    } else if (child) {
      child.dispose();
    }
  },
  unbind: function () {
    BaseBlockBinding.prototype.unbind.call(this);
    return this.child ? this.child.dispose() : undefined;
  }
});

module.exports = ConditionalBlockBinding;

},{"./base":10}],12:[function(require,module,exports){
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
    return this.options.class.getNode ? this.options.class.getNode(this.options) : undefined;
  },
  prepare: function () {
    return this.options.class.prepare ? this.options.class.prepare(this.options) : undefined;
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

    var clazz = this.options.class;


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
  path: function() {
    if (this._path) return this._path;

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
        options.class = bd;
        if (bd.prepare) bd.prepare(options);
        return new Binder(options);
      }
    }
  },
  register: function (name, bindingClass) {
    bindingClasses[name] = bindingClass;
  }
});

module.exports = new Factory();

},{"../../../clip":3,"../collection":15,"./conditional":11,"./html":13,"./value":14,"loaf":58,"protoclass":64}],13:[function(require,module,exports){
var type         = require("type-component"),
BaseBlockBinding = require("./base");

function HtmlBlockBinding () {
  BaseBlockBinding.apply(this, arguments);
}

BaseBlockBinding.extend(HtmlBlockBinding, {
  _onChange: function (value, oldValue) {

    if (oldValue && oldValue.remove) {
      oldValue.remove();
    }

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
      if (this.nodeFactory.name === "string") {
        node = this.nodeFactory.createTextNode(String(value));
      } else {
        var div = this.nodeFactory.createElement("div");
        div.innerHTML = String(value);
        node = this.nodeFactory.createFragment(div.childNodes);
      }
    }

    return this.section.replaceChildNodes(node);
  }
});

module.exports = HtmlBlockBinding;

},{"./base":10,"type-component":65}],14:[function(require,module,exports){
var protoclass = require("protoclass"),
BaseDecor      = require("./base");

function ValueDecor (options) {
  this.node = options.node;
  BaseDecor.call(this, options);
}

protoclass(BaseDecor, ValueDecor, {

  /**
   */

  update: function () {

    var value = this.value;

    if (value == undefined) {
      value = "";
    }

    // TODO - this is a good place to have a setup function for DOM elements
    // so that we never have to call this.section.appendChild
    // minor optimization - don't create text nodes unnessarily
    if (this.nodeFactory.name === "dom") {
      this.node.nodeValue = String(value);
    } else if(this.node.replaceText) {
      this.node.replaceText(value, true);
    }
  }
});

ValueDecor.getNode = function (options) { 
  return options.node = options.application.nodeFactory.createTextNode("", true)
}

module.exports = ValueDecor;
},{"./base":10,"protoclass":64}],15:[function(require,module,exports){
var BaseBinding = require("./base/binding");

function BindingCollection (node, source) {
    this._source = source || [];
}

BaseBinding.extend(BindingCollection, {
  push: function () {
    this._source.push.apply(this._source, arguments);
  },
  bind: function (context, node) {
    for (var i = 0, n = this._source.length; i < n; i++) {
      this._source[i].bind(context, node);
    }
  },
  unbind: function () {
    for (var i = 0, n = this._source.length; i < n; i++) {
      this._source[i].unbind();
    }
  }
});

module.exports = BindingCollection;

},{"./base/binding":7}],16:[function(require,module,exports){
module.exports = {
  BaseBlockBinding    : require("./block/base"),
  blockBindingFactory : require("./block/factory"),
  nodeBindingFactory  : require("./node/factory"),
  BaseNodeBinding     : require("./node/base"),
  BaseAttrDataBinding : require("./node/attrs/dataBind/handlers/base")
};

},{"./block/base":10,"./block/factory":12,"./node/attrs/dataBind/handlers/base":17,"./node/base":31,"./node/factory":32}],17:[function(require,module,exports){
var BaseScriptBinding = require("../../../../base/script");

function BaseDataBindHandler (application, node, clip, name) {
  this.node = node;
  BaseScriptBinding.call(this, application, this.clip = clip, this.name = name);
}

BaseScriptBinding.extend(BaseDataBindHandler, {
});

module.exports = BaseDataBindHandler;

},{"../../../../base/script":8}],18:[function(require,module,exports){
var EventDataBinding = require("./event"),
_                    = require("underscore");

function ChangeAttrBinding () {
  EventDataBinding.apply(this, arguments);
}

ChangeAttrBinding.events = "keydown change input mousedown mouseup click";

EventDataBinding.extend(ChangeAttrBinding, {
  preventDefault: false,
  event: ChangeAttrBinding.events,
  _update: function (event) {
    clearTimeout(this._changeTimeout);
    this._changeTimeout = setTimeout(_.bind(this._update2, this), 5);
  },
  _update2: function () {
    this.script.update();
  }
});

module.exports = ChangeAttrBinding;

},{"./event":24,"underscore":66}],19:[function(require,module,exports){
var BaseDataBinding = require("./base");

function CssAttrBinding () {
  BaseDataBinding.apply(this, arguments);
};

BaseDataBinding.extend(CssAttrBinding, {
  _onChange: function (classes) {
    var classesToUse = this.node.getAttribute("class");
    classesToUse     = classesToUse ? classesToUse.split(" ") : [];

    for (var classNames in classes) {

      var useClass = classes[classNames];
      var classNamesArray = classNames.split(/,\s*/);

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

module.exports = CssAttrBinding;

},{"./base":17}],20:[function(require,module,exports){
var EventDataBinding = require("./event");

function DeleteAttrBinding () {
  EventDataBinding.apply(this, arguments);
}


EventDataBinding.extend(DeleteAttrBinding, {
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {
    if (!~[8].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

module.exports = DeleteAttrBinding;

},{"./event":24}],21:[function(require,module,exports){
var BaseDataBinding = require("./base");

function DisableAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(DisableAttrBinding, {
  _onChange: function (value) {
    if (value) {
      this.node.setAttribute("disabled", "disabled");
    } else {
      this.node.removeAttribute("disabled");
    }
  }
});

module.exports = DisableAttrBinding;

},{"./base":17}],22:[function(require,module,exports){
var BaseDataBinding = require("./base");

function EnableAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(EnableAttrBinding, {
  _onChange: function (value) {
    if (value) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  }
});

module.exports = EnableAttrBinding;

},{"./base":17}],23:[function(require,module,exports){
var EventDataBinding = require("./event");

function EnterAttrBinding () {
  EventDataBinding.apply(this, arguments);
}


EventDataBinding.extend(EnterAttrBinding, {
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {
    if (!~[13].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

module.exports = EnterAttrBinding;

},{"./event":24}],24:[function(require,module,exports){
var BaseDataBinding = require("./base"),
_                   = require("underscore");

function EventDataBinding () {
  BaseDataBinding.apply(this, arguments);
  this._onEvent = _.bind(this._onEvent, this);
}

BaseDataBinding.extend(EventDataBinding, {
  watch: false,
  propagateEvent: true,
  preventDefault: false,
  bind: function () {
    BaseDataBinding.prototype.bind.apply(this, arguments);

    var event = (this.event || this.name).toLowerCase(),
    name      = this.name.toLowerCase();

    if (name.substr(0, 2) === "on") {
      name = name.substr(2);
    }

    if (event.substr(0, 2) === "on") {
      event = event.substr(2);
    }

    this._updateScript(this.clip.script("propagateEvent"));
    this._updateScript(this.clip.script("preventDefault"));

    if (~["click", "mouseup", "mousedown", "submit"].indexOf(name)) {
      this.preventDefault = true;
      this.propagateEvent = false;
    }

    this._pge = "propagateEvent." + name;
    this._pde = "preventDefault." + name;

    this._setDefaultProperties(this._pge);
    this._setDefaultProperties(this._pde);

    (this.$node = $(this.node)).bind(this._event = event, this._onEvent);
  },
  unbind: function () {
    BaseDataBinding.prototype.unbind.call(this);
    return this.$node.unbind(this._event, this._onEvent);
  },
  _updateScript: function (script) {
    if (script) script.update();
  },
  _setDefaultProperties: function (ev) {
    var prop = ev.split(".").shift();
    if (!this.clip.has(ev) && !this.clip.has(prop) && this[prop] != null) {
      this.clip.set(ev, this[prop]);
    }
  },
  _onEvent: function (event) {
    if (this.clip.get("propagateEvent") !== true && this.clip.get(this._pge) !== true) {
      event.stopPropagation();
    }

    if(this.clip.get("preventDefault") === true || this.clip.get(this._pde) === true) {
     event.preventDefault();
    }

    if (this.clip.get("disable")) return;

    this.clip.data.set("event", event);
    this._update(event);
  },
  _update: function (event) {
    this.script.update();
  }
});

module.exports = EventDataBinding;
},{"./base":17,"underscore":66}],25:[function(require,module,exports){
(function (process){
var protoclass = require("protoclass"),
BaseBinding = require("./base");

function FocusAttrBinding () {
  BaseBinding.apply(this, arguments);
}

protoclass(BaseBinding, FocusAttrBinding, {

  /**
   */

  _onChange: function (value) {
    if (!value || !process.browser) return;
    $(this.node).focus();
  }
});

module.exports = FocusAttrBinding;
}).call(this,require("/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./base":17,"/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":56,"protoclass":64}],26:[function(require,module,exports){
(function (process){
var _             = require("underscore"),
ChangeAttrBinding = require("./change"),
BaseBinding       = require("./base"),
type              = require("type-component"),
dref              = require("dref");


function ModelAttrBinding () {
  this._elementValue = _.bind(this._elementValue, this);
  this._onValueChange = _.bind(this._onValueChange, this);
  this._onChange = _.bind(this._onChange, this);
  this._onElementChange = _.bind(this._onElementChange, this);
  ModelAttrBinding.__super__.constructor.apply(this, arguments);
}

BaseBinding.extend(ModelAttrBinding, {
  bind: function () {
    var self = this;


    if (/^(text|password)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function () {
        self._onElementChange();
      }, 500);
    }

    ModelAttrBinding.__super__.bind.apply(this, arguments);

    (this.$element = $(this.node)).bind(ChangeAttrBinding.events, this._onElementChange);
    this._nameBinding = this.clip.data.bind("name", this._onChange);
    this._onChange();
  },

  _onElementChange: function (event) {

    if (event) event.stopPropagation();
    clearTimeout(this._changeTimeout);

    var self = this;


    function applyChange () {
      var value = self._parseValue(self._elementValue()),
      name      = self._elementName(),
      refs      = self.script.refs,
      model     = self.clip.get("model");


      if (self.clip.get("bothWays") !== false) {
        ref = name || (refs.length ? refs[0] : undefined);

        if (!name) {
          model = self.context;
        }

        self.currentValue = value;

        if (model) {
          if (model.set) {
            model.set(ref, value);
          } else {
            dref.set(model, ref, value);
          }
        }
      }
    }

    if (!process.browser) {
      applyChange();
    } else {
      this._changeTimeout = setTimeout(applyChange, 5);
    }
  },

  unbind: function () {
    ModelAttrBinding.__super__.unbind.apply(this, arguments);
    clearInterval(this._autocompleteCheckInterval);
    if (this._modelBinding) this._modelBinding.dispose();
    if (this._nameBinding) this._nameBinding.dispose();
    this.$element.unbind(ChangeAttrBinding.events, this._onElementChange);
  },

  _onChange: function () {
    var model = this.clip.get("model");

    var name = this._elementName();
    if (this._modelBinding) this._modelBinding.dispose();

    if (name) {
      this._modelBinding = model ? model.bind(name, _.bind(this._onValueChange, this)).now() : undefined;
    } else if (type(model) !== "object") {
      this._onValueChange(model);
    }
  },

  _onValueChange: function (value) {
    this._elementValue(this._parseValue(value));
  },

  _parseValue: function(value) {
    if ((value == null) || value === "") {
      return void 0;
    }
    return value;
  },

  _elementValue: function (value) {

    var isInput = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase())

    if (!arguments.length) return isInput ? this._checkedOrValue() : this.node.innerHTML;

    if (value == null) {
      value = "";
    }

    if (this.currentValue === value) {
      return;
    }

    this.currentValue = value;

    if (isInput) {
      this._checkedOrValue(value);
    } else {
      this.node.innerHTML = value;
    }
  },

  _elementName: function () {
    return $(this.node).attr("name");
  },

  _checkedOrValue: function (value) {

    var isCheckbox    = /checkbox/.test(this.node.type),
    isRadio           = /radio/.test(this.node.type),
    isRadioOrCheckbox = isCheckbox || isRadio;

    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean($(this.node).is(":checked"));
      } else {
        return this.node.value;
      }
    }

    if (isRadioOrCheckbox) {
      if (isRadio) {
        if (String(value) === String($(this.node).val())) {
          $(this.node).prop("checked", true);
        }
      } else {
        this.node.checked = value;
      }
    } else {
      this.node.value = value;
    }
  }
});

module.exports = ModelAttrBinding;

}).call(this,require("/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./base":17,"./change":18,"/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":56,"dref":57,"type-component":65,"underscore":66}],27:[function(require,module,exports){
var BaseDataBinding = require("./base");

function ShowAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(ShowAttrBinding, {
  bind: function (context) {
    this._displayStyle = this.node.style.display;
    BaseDataBinding.prototype.bind.call(this, context);
  },
  _onChange: function (value) {
    this.node.style.display = value ? this._displayStyle : "none";
  }
});

module.exports = ShowAttrBinding;

},{"./base":17}],28:[function(require,module,exports){
(function (process){
var BaseDataBinding = require("./base");

function StyleAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(StyleAttrBinding, {
  bind: function (context) {
    this._currentStyles = {};
    BaseDataBinding.prototype.bind.call(this, context);
  },
  _onChange: function (styles) {

    var newStyles = {};
    
    for (var name in styles) {
      var style = styles[name];
      if (style !== this._currentStyles[name]) {
        newStyles[name] = this._currentStyles[name] = style || "";
      }
    }

    if (!process.browser) {
      for (var key in newStyles) {
        this.node.style[key] = newStyles[key];
      }
    } else {
      $(this.node).css(newStyles);
    }
  }
});

module.exports = StyleAttrBinding;

}).call(this,require("/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./base":17,"/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":56}],29:[function(require,module,exports){
var Clip          = require("../../../../../clip"),
BindingCollection = require("../../../collection"),
BaseBinding       = require("../../base");

var dataBindingClasses = {
  show    : require("./handlers/show"),
  css     : require("./handlers/css"),
  style   : require("./handlers/style"),
  focus   : require("./handlers/focus"),

  disable : require("./handlers/disable"),
  enable  : require("./handlers/enable"),
  model   : require("./handlers/model"),

  onClick      : require("./handlers/event"),
  onLoad       : require("./handlers/event"),
  onSubmit     : require("./handlers/event"),
  onMouseDown  : require("./handlers/event"),
  onMouseUp    : require("./handlers/event"),
  onMouseOver  : require("./handlers/event"),
  onMouseOut   : require("./handlers/event"),
  onKeyDown    : require("./handlers/event"),
  onKeyUp      : require("./handlers/event"),
  onEnter      : require("./handlers/enter"),
  onChange     : require("./handlers/change"),
  onDelete     : require("./handlers/delete")
}


function AttrDataBinding (options) {

  BaseBinding.call(this, options);

  this.clip = new Clip({
    scripts     : options.value[0],
    watch       : false,
    application : options.application
  });

  this._bindings = new BindingCollection();

  for (var i = 0, n = this.clip.scripts.names.length; i < n; i++) {
    var scriptName = this.clip.scripts.names[i], bc;
    if (!(bc = dataBindingClasses[scriptName])) continue;
    this._bindings.push(new bc(options.application, this.node, this.clip, scriptName));
  }
}

BaseBinding.extend(AttrDataBinding, {
  type: "attr",
  bind: function (context) {
    this.context = context;
    this.clip.reset(context, false);
    this._bindings.bind(context);
  },
  unbind: function () {
    this._bindings.unbind();
    this.clip.dispose();
  }
});



module.exports = AttrDataBinding;
module.exports.register = function (name, dataBindClass) {
  dataBindingClasses[name] = dataBindClass;
}

},{"../../../../../clip":3,"../../../collection":15,"../../base":31,"./handlers/change":18,"./handlers/css":19,"./handlers/delete":20,"./handlers/disable":21,"./handlers/enable":22,"./handlers/enter":23,"./handlers/event":24,"./handlers/focus":25,"./handlers/model":26,"./handlers/show":27,"./handlers/style":28}],30:[function(require,module,exports){
var type      = require("type-component"),
ClippedBuffer = require("../../../../../clip/buffer"),
BaseBinding   = require("../../base"),
_             = require("underscore");

function AttrTextBinding (options) {
  BaseBinding.apply(this, arguments);
  this.clippedBuffer = new ClippedBuffer(this.value, options.application);
}

BaseBinding.extend(AttrTextBinding, {
  type: "attr",
  bind: function (context) {
    this.context = context;
    this._binding = this.clippedBuffer.reset(this.context).bind("value", _.bind(this._onChange, this)).now();
  },
  unbind: function () {
    if (this._binding) this._binding.dispose();
    this.clippedBuffer.dispose();
  },
  _onChange: function (text) {
    if (!text.length) {
      return this.node.removeAttribute(this.name);
    }
    this.node.setAttribute(this.name, text);
  },
  test: function (binding) {
    if (type(binding.value) !== "array") {
      return false;
    }
    for (var i = 0, n = binding.value.length; i < n; i++) {
      if (binding.value[i].fn) return true;
    }

    return false;
  }
});


module.exports = AttrTextBinding;

},{"../../../../../clip/buffer":2,"../../base":31,"type-component":65,"underscore":66}],31:[function(require,module,exports){
var BaseBinding = require("../../base/binding");

function BaseNodeBinding (options) {
  this.name      = options.name || this.namel
  this.node      = options.node;
  this.value     = options.value;
  this.nodeMOdel = options.context;
}

BaseBinding.extend(BaseNodeBinding, {
  bind: function (context) {
    this.context = context;
  },
  unbind: function () {
    // OVERRIDE ME
  }
});

module.exports = BaseNodeBinding;

},{"../../base/binding":7}],32:[function(require,module,exports){
var _      = require("underscore"),
protoclass = require("protoclass");


var allBindingClasses = {
  node: {},
  attr: {
    "default": []
  }
};


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
      var clazz = this.options.class;


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
      var bindingClasses = allBindingClasses[bindable.type][bindable.key] || [];
      for (var j = 0, n2 = bindingClasses.length; j < n2; j++) {
        var bindingClass = bindingClasses[j];
        if (bindingClass.prototype.test(bindable)) {
          bindable.class = bindingClass;
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

    var classes = allBindingClasses[type];


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

var nodeFactory = module.exports = new NodeBindingFactory();

var defaultBindingClasses = {
  "default": [
    require("./attrs/text")
  ],
  "data-bind": [
    module.exports.dataBind = require("./attrs/dataBind")
  ]
}

for (var type in defaultBindingClasses) {
  var classes = defaultBindingClasses[type];
  for (var i = 0, n = classes.length; i < n; i++) {
    nodeFactory.register(type, classes[i]);
  }
}

},{"./attrs/dataBind":29,"./attrs/text":30,"protoclass":64,"underscore":66}],33:[function(require,module,exports){
var protoclass = require("protoclass"),
BaseBinder     = require("../base/binder"),
TextBinding    = require("./binding");

function TextBlockBinder (options) {
  BaseBinder.apply(this, arguments);
  this.blocks = options.blocks;
}

BaseBinder.extend(TextBlockBinder, {

  /**
   */

  getBinding: function (templateNode) {
    var mark = this._findMark(templateNode);
    return new TextBinding(mark, this.blocks, this.application);
  }
});

module.exports = TextBlockBinder;
},{"../base/binder":6,"./binding":34,"protoclass":64}],34:[function(require,module,exports){
var protoclass = require("protoclass"),
BaseBinding    = require("../base/binding"),
ClippedBuffer  = require("../../../clip/buffer"),
_              = require("underscore");

function TextBlockBinding (textNode, blocks, application) {
  this.node        = textNode;
  this.blocks      = blocks;
  this.application = application;
  this.clip        = new ClippedBuffer(blocks, application);
}

BaseBinding.extend(TextBlockBinding, {

  /**
   */

  bind: function (context) {
    return this._binding = this.clip.reset(context).bind("value", _.bind(this.update, this)).now();
  },

  /**
   */

  unbind: function () {
    this._binding.dispose();
  },

  /**
   */

  update: function () {

    this.node.nodeValue = String(this.clip.value);

    if (this.node.replaceText) {
      this.node.replaceText(this.clip.value, true);
    }
  }

});

module.exports = TextBlockBinding;


},{"../../../clip/buffer":2,"../base/binding":7,"protoclass":64,"underscore":66}],35:[function(require,module,exports){
var Clip  = require("../clip"),
template  = require("./template"),
nofactor  = require("nofactor"),
modifiers = require("./modifiers"),
bindings  = require("./bindings"),
bindable  = require("bindable");

module.exports = {

  /*
   */
  Clip: Clip,

  /*
   */

  bindable: bindable,

  /*
   parses a template
   */

  template: template,

  /*
   registers a binding modifier 
   {{ message | titlecase() }}
   */

  modifier: function (name, modifier) {
    return modifiers[name] = modifier;
  },

  /*
   expose the class so that one can be registered
   */

  BaseBlockBinding: bindings.BaseBlockBinding,

  /*
   */

  BaseNodeBinding: bindings.BaseNodeBinding,

  /*
   */

  BaseAttrDataBinding: bindings.BaseAttrDataBinding,

  /*
   adds a block binding class
   {{#custom}}
   {{/}}
   */

  blockBinding: bindings.blockBindingFactory.register,

  /*
   adds a node binding shim
   <custom />
   <div custom="" />
   */

  nodeBinding: bindings.nodeBindingFactory.register,

  /*
    data-bind="{{ custom: binding }}"
   */

  attrDataBinding: bindings.nodeBindingFactory.dataBind.register,

  /*
   */
  use: function(fn) {
    return fn(this);
  }
};

},{"../clip":3,"./bindings":16,"./modifiers":36,"./template":37,"bindable":47,"nofactor":62}],36:[function(require,module,exports){
module.exports = {
  uppercase: function (value) {
    return String(value).toUpperCase();
  },
  lowercase: function (value) {
    return String(value).toLowerCase();
  },
  titlecase: function (value) {
    var str;

    str = String(value);
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  },
  json: function (value, count, delimiter) {
    return JSON.stringify.apply(JSON, arguments);
  }
};
},{}],37:[function(require,module,exports){
(function (process){
var protoclass    = require("protoclass"),
modifiers         = require("./modifiers"),
nofactor          = require("nofactor"),
FragmentWriter    = require("./writers/fragment"),
BlockWriter       = require("./writers/block"),
TextWriter        = require("./writers/text"),
TextBlockWriter   = require("./writers/textBlock"),
ElementWriter     = require("./writers/element"),
ParseWriter       = require("./writers/parse"),
BindingCollection = require("./bindings/collection"),
BinderCollection  = require("./bindings/binders"),
Application       = require("./application"),
bindable          = require("bindable")
loaf              = require("loaf"),
PaperBinding      = require("./binding");


function Template (paper, application, ops) {
  this.paper         = paper;
  this.application   = application;
  this.nodeFactory   = application.nodeFactory;
  this.binders       = new BinderCollection();
  this.useTemplateNode = ops.useTemplateNode;
}


protoclass(Template, {

  /**
   * useful for warming up a template
   */

  load: function (section) {

    if (!this._templateNode || !this.useTemplateNode) {
      this._templateNode = this._createTemplateNode();
    }

    var node = this.useTemplateNode ? this._templateNode.cloneNode(true) : this._templateNode;
    var bindings = this.binders.getBindings(node);

    if (!section) {
      section = loaf(this.nodeFactory);
    }

    section.append(node);

    return new PaperBinding(this, node, bindings, section, this.nodeFactory);
  },

  /**
   * binds loads, and binds the template to a context
   */

  bind: function (context, section) {

    if (!context) {
      context = {};
    }

    if (!context.__isBindable) {
      context = new bindable.Object(context);
    }

    return this.load(section).bind(context);
  },

  /**
   * create the template node so we don't re-construct the DOM each time - this
   * is optimal - we can use cloneNode instead which defers the DOM creation to the browser.
   */

  _createTemplateNode: function () {

    var writers = {
      fragment  : new FragmentWriter(this),
      block     : new BlockWriter(this),
      text      : new TextWriter(this),
      element   : new ElementWriter(this),
      parse     : new ParseWriter(this),
      textBlock : new TextBlockWriter(this)
    }

    var node = this.paper(
      writers.fragment.write,
      writers.block.write,
      writers.element.write,
      writers.text.write,
      writers.textBlock.write,
      writers.parse.write,
      modifiers
    );

    this.binders.init();

    return node;
  }

});


var defaultApplication = new Application();


var tpl = Template.prototype.creator = module.exports = function (paperOrSrc, application) {

  var paper, isIE = false;

  if (!application) {
    application = defaultApplication;
  }

  if (typeof paperOrSrc === "string") {

    if (!tpl.compiler) {
      throw new Error("template must be a function");
    }

    paper = tpl.compiler.compile(paperOrSrc, { eval: true });
  } else {
    paper = paperOrSrc;
  }

  // check for all versions of IE
  if (process.browser) {
    isIE = ~navigator.userAgent.toLowerCase().indexOf("msie") || ~navigator.userAgent.toLowerCase().indexOf("trident")
  }

  var ops = {
    useTemplateNode: !application.fake && !isIE
  };

  if (ops.useTemplateNode && paper.template) {
    return paper.template;
  }

  return paper.template = new Template(paper, application, ops);
}
}).call(this,require("/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./application":4,"./binding":5,"./bindings/binders":9,"./bindings/collection":15,"./modifiers":36,"./writers/block":39,"./writers/element":40,"./writers/fragment":41,"./writers/parse":42,"./writers/text":43,"./writers/textBlock":44,"/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":56,"bindable":47,"loaf":58,"nofactor":62,"protoclass":64}],38:[function(require,module,exports){
var protoclass = require("protoclass"),
_ = require("underscore");


function BaseWriter (template) {
  this.template    = template;
  this.nodeFactory = template.application.nodeFactory;
  this.application = this.template.application;
  this.binders     = template.binders;
  this.write       = _.bind(this.write, this);
}

protoclass(BaseWriter, {
  write: function (script, contentFactory, childBlockFactory) { }
});

module.exports = BaseWriter;

},{"protoclass":64,"underscore":66}],39:[function(require,module,exports){
var loaf            = require("loaf"),
blockBindingFactory = require("../bindings/block/factory"),
Clip                = require("../../clip"),
BaseWriter          = require("./base");


function BlockWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(BlockWriter, {

  /**
   */

  write: function (script, contentFactory, childBlockFactory) {

    var tpl  = contentFactory    ? this.template.creator(contentFactory, this.application) : undefined,
    childTpl = childBlockFactory ? this.template.creator(childBlockFactory, this.application) : undefined,
    binder,
    ops;

    this.binders.push(binder = blockBindingFactory.getBinder(ops = {
      script             : script,
      template           : tpl,
      application        : this.application,
      childBlockTemplate : childTpl
    }));

    var node = binder.getNode(ops) || this.getDefaultNode(ops);

    binder.prepare(ops);
    return node;
  },

  /**
   */

  getDefaultNode: function (ops) {
    return (ops.section = loaf(this.nodeFactory)).render();
  }
});

module.exports = BlockWriter;

},{"../../clip":3,"../bindings/block/factory":12,"./base":38,"loaf":58}],40:[function(require,module,exports){
var nodeBindingFactory = require("../bindings/node/factory"),
type                   = require("type-component"),
BaseWriter             = require("./base");

function ElementWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(ElementWriter, {
  write: function (name, attributes, children) {

      if (!attributes) attributes = {};
      if (!children) children = [];

      var element = this.nodeFactory.createElement(name), attrName, value;

      for (attrName in attributes) {
          value = attributes[attrName];
          if (typeof value === "object") continue;
          element.setAttribute(attrName, value);
      }

      this.binders.push.apply(this.binders, nodeBindingFactory.getBinders({
        node        : element,
        nodeName    : name,
        application : this.application,
        attributes  : attributes
      }));

      for (var i = 0, n = children.length; i < n; i++) {
        element.appendChild(children[i]);
      }

      return element;
  }
});

module.exports = ElementWriter;

},{"../bindings/node/factory":32,"./base":38,"type-component":65}],41:[function(require,module,exports){
var BaseWriter = require("./base");

function FragmentWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(FragmentWriter, {
  write: function (children) {
    if (children.length === 1) return children[0];
    return this.nodeFactory.createFragment(children);
  }
});

module.exports = FragmentWriter;

},{"./base":38}],42:[function(require,module,exports){
(function (process){
var BaseWriter = require("./base");

function ParseWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(ParseWriter, {
  write: function (source) {
    var element;
    
    if (process.browser) {
      element = this.nodeFactory.createElement("div");
      element.innerHTML = source;
    } else {
      element = this.nodeFactory.createTextNode(source);
    }

    return element;
  }
});

module.exports = ParseWriter;

}).call(this,require("/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./base":38,"/Users/craig/Developer/Public/paperclip.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":56}],43:[function(require,module,exports){
var BaseWriter = require("./base");

function TextWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(TextWriter, {
  write: function (text) {
    return this.nodeFactory.createTextNode(text);
  }
});

module.exports = TextWriter;

},{"./base":38}],44:[function(require,module,exports){
var BaseWriter  = require("./base"),
TextBlockBinder = require("../bindings/textBlock/binder");

function TextBlockWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(TextBlockWriter, {

  /**
   */

  write: function (blocks) {

    var node = this.nodeFactory.createTextNode("");
    
    this.binders.push(new TextBlockBinder({
      marker      : node,
      blocks      : blocks,
      application : this.application
    }))

    return node;
  }
});

module.exports = TextBlockWriter;
},{"../bindings/textBlock/binder":33,"./base":38}],45:[function(require,module,exports){
var BindableObject = require("../object"),
computed           = require("../utils/computed"),
sift               = require("sift");

/**
 */

function BindableCollection(source) {
  BindableObject.call(this, this);
  this._source = source || [];
  this._updateInfo();
}

/**
 */

BindableObject.extend(BindableCollection, {

  /**
   */

  __isBindableCollection: true,

  /**
   */

  reset: function (source) {
    return this.source(source);
  },

  /**
   */

  source: function (source) {

    if (!arguments.length) return this._source;
    var oldSource = this._source || [];
    this._source = source || [];
    this._updateInfo();

    this.emit("reset", this._source);
  },

  /**
   */

  indexOf: function (item) {
    return this._source.indexOf(item);
  },

  /**
   */

  filter: function (fn) {
    return this._source.filter(fn);
  },

  /**
   */

  search: function (query) {
    return sift(query, this._source).shift();
  },

  /**
   */

  searchIndex: function (query) {
    return this.indexOf(this.search(query));
  },

  /**
   */

  at: function (index) {
    return this._source[index];
  },

  /**
   */

  each: computed(["length"], function (fn) {
    this._source.forEach(fn);
  }),

  /**
   */

  map: function (fn) {
    return this._source.map(fn);
  },

  /**
   */

  join: function (sep) {
    return this._source.join(sep);
  },

  /**
   */

  push: function (item) {
    this._source.push(item);
    this._updateInfo();
    this.emit("insert", item, this._source.length - 1);
  },

  /**
   */

  unshift: function (item) {
    this._source.push(item);
    this._updateInfo();
    this.emit("insert", item, 0);
  },

  /**
   */

  splice: function (index, count) {
    var newItems = Array.prototype.slice.call(arguments, 2),
    oldItems     = this._source.splice.apply(this._source, arguments);

    this._updateInfo();
    this.emit("replace", newItems, oldItems, index);
  },

  /**
   */

  remove: function (item) {
    var i = this.indexOf(item);
    if (!~i) return false;
    this._source.splice(i, 1);
    this._updateInfo();
    this.emit("remove", item, i);
    return item;
  },

  /**
   */

  pop: function () {
    if (!this._source.length) return;
    return this.remove(this._source[this._source.length - 1]);
  },

  /**
   */

  shift: function () {
    if (!this._source.length) return;
    return this.remove(this._source[0]);
  },

  /**
   */

  _updateInfo: function () {
    this.set("first", this._source.length ? this._source[0] : undefined);
    this.set("length", this._source.length);
    this.set("empty", !this._source.length);
    this.set("last", this._source.length ? this._source[this._source.length - 1] : undefined);
  }
});

module.exports = BindableCollection;

},{"../object":48,"../utils/computed":51,"sift":54}],46:[function(require,module,exports){
var protoclass = require("protoclass"),
disposable     = require("disposable");

function EventEmitter () {
  this._events = {};
}

EventEmitter.prototype.setMaxListeners = function () {

}

EventEmitter.prototype.on = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  var listeners;
  if (!(listeners = this._events[event])) {
    this._events[event] = listener;
  } else if (typeof listeners === "function") {
    this._events[event] = [listeners, listener];
  } else {
    listeners.push(listener);
  }

  var self = this;

  return {
    dispose: function() {
      self.off(event, listener);
    }
  }
}

EventEmitter.prototype.off = function (event, listener) {

  var listeners;

  if(!(listeners = this._events[event])) {
    return;
  }

  if (typeof listeners === "function") {
    this._events[event] = undefined;
  } else {
    var i = listeners.indexOf(listener);
    if (~i) listeners.splice(i, 1);
    if (!listeners.length) {
      this._events[event] = undefined;
    }
  }

}

EventEmitter.prototype.once = function (event, listener) {

  function listener2 () {
    disp.dispose();
    listener.apply(this, arguments);
  }

  var disp = this.on(event, listener2);  
  disp.target = this;
  return disp;
}

EventEmitter.prototype.emit = function (event) {

  if (this._events[event] === undefined) return;

  var listeners = this._events[event];


  if (typeof listeners === "function") {
    if (arguments.length === 1) {
      listeners();
    } else {
    switch(arguments.length) {
      case 2:
        listeners(arguments[1]);
        break;
      case 3:
        listeners(arguments[1], arguments[2]);
        break;
      case 4:
        listeners(arguments[1], arguments[2], arguments[3]);
        break;
      default:
        var n = arguments.length;
        var args = new Array(n - 1);
        for(var i = 1; i < n; i++) args[i-1] = arguments[i];
        listeners.apply(this, args);
    }
  }
  } else {
    var n = arguments.length;
    var args = new Array(n - 1);
    for(var i = 1; i < n; i++) args[i-1] = arguments[i];
    for(var j = listeners.length; j--;) {
      if(listeners[j]) listeners[j].apply(this, args);
    }
  }
}


EventEmitter.prototype.removeAllListeners = function (event) {
  if (arguments.length === 1) {
    this._events[event] = undefined;
  } else {
    this._events = {};
  }
}



module.exports = EventEmitter;
},{"disposable":53,"protoclass":64}],47:[function(require,module,exports){
module.exports = {
  Object       : require("./object"),
  Collection   : require("./collection"),
  EventEmitter : require("./core/eventEmitter"),
  computed     : require("./utils/computed"),
  options      : require("./utils/options")
};

if (typeof window !== "undefined") {
  window.bindable = module.exports;
}
},{"./collection":45,"./core/eventEmitter":46,"./object":48,"./utils/computed":51,"./utils/options":52}],48:[function(require,module,exports){
var EventEmitter    = require("../core/eventEmitter"),
protoclass          = require("protoclass"),
watchProperty       = require("./watchProperty");

function Bindable (context) {

  if (context) {
    this.context(context);
  } else {
    this.__context = {};
  }

  Bindable.parent.call(this);
}

watchProperty.BindableObject = Bindable;

protoclass(EventEmitter, Bindable, {

  /**
   */

  __isBindable: true,

  /**
   */

  context: function (data) {
    if (!arguments.length) return this.__context;

    // only exception is 
    if (data.__isBindable && data !== this) {
      throw new Error("context cannot be a bindable object");
    }

    this.__context = data;
  },

  /**
   */

  keys: function () {
    return Object.keys(this.toJSON());
  },

  /**
   */

  has: function (key) {
    return this.get(key) != null;
  },


  /**
   */

  get: function (property) {

    var isString;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      return this.__context[property];
    }

    // avoid split if possible
    var chain    = isString ? property.split(".") : property,
    ctx          = this.__context,
    currentValue = ctx,
    currentProperty;

    // go through all the properties
    for (var i = 0, n = chain.length - 1; i < n; i++) {

      currentValue    = currentValue[chain[i]];

      if (!currentValue) return;

      // current value is a bindable item? grab the context
      if (currentValue.__isBindable && currentValue !== ctx) {  
        currentValue = currentValue.__context;
      }
    }
    // might be a bindable object
    if(currentValue) return currentValue[chain[i]];
  },

  /**
   */

  setProperties: function (properties) {
    for (var property in properties) {
      this.set(property, properties[property]);
    }
    return this;
  },

  /**
   */

  set: function (property, value) {

    var isString, hasChanged, oldValue;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      hasChanged = (oldValue = this.__context[property]) !== value;
      if (hasChanged) this.__context[property] = value;
    } else {

      // avoid split if possible
      var chain     = isString ? property.split(".") : property,
      ctx           = this.__context,
      currentValue  = ctx,
      previousValue,
      currentProperty,
      newChain;


      for (var i = 0, n = chain.length - 1; i < n; i++) {

        currentProperty = chain[i];
        previousValue   = currentValue;
        currentValue    = currentValue[currentProperty];


        // need to take into account functions - easier not to check
        // if value exists
        if (!currentValue /* || (typeof currentValue !== "object")*/) {
          currentValue = previousValue[currentProperty] = {};
        }

        // is the previous value bindable? pass it on
        if (currentValue.__isBindable) {



          newChain = chain.slice(i + 1);
          // check if the value has changed
          hasChanged = (oldValue = currentValue.get(newChain)) !== value;
          currentValue.set(newChain, value);
          currentValue = oldValue;
          break;
        }
      }


      if (!newChain && (hasChanged = (currentValue !== value))) {
        currentProperty = chain[i];
        oldValue = currentValue[currentProperty];
        currentValue[currentProperty] = value;
      }
    }

    if (!hasChanged) return value;

    var prop = chain ? chain.join(".") : property;

    this.emit("change:" + prop, value, oldValue);
    this.emit("change", prop, value, oldValue);
    return value;
  },

  /**
   */

  bind: function (property, fn, now) {
    return watchProperty(this, property, fn, now);
  },

  /**
   */

  dispose: function () {
    this.emit("dispose");
  },

  /**
   */

  toJSON: function () {
    var obj = {}, value;

    for (var key in this.__context) {
      value = this.__context[key];
      
      if(value && value.__isBindable) {
        value = value.toJSON()
      }

      obj[key] = value;
    }
    return obj;
  }
});

module.exports = Bindable;

},{"../core/eventEmitter":46,"./watchProperty":50,"protoclass":64}],49:[function(require,module,exports){
var toarray = require("toarray"),
_           = require("underscore");

/*
bindable.bind("property", {
  when: tester,
  defaultValue: defaultValue,
  map: function(){},
  to: ["property"],
  to: {
    property: {
      map: function (){}
    }
  }
}).now();
*/

function getToPropertyFn (target, property) {
  return function (value) {
    target.set(property, value);
  };
}

function wrapFn (fn, previousValues, max) {

  var numCalls = 0;

  return function () {

    var values = Array.prototype.slice.call(arguments, 0),
    newValues  = (values.length % 2) === 0 ? values.slice(0, values.length / 2) : values;

    if (_.intersection(newValues, previousValues).length === newValues.length) {
      return;
    }

    if (~max && ++numCalls >= max) {
      this.dispose();
    }

    previousValues = newValues;


    fn.apply(this, values);
  }
}

function transform (bindable, fromProperty, options) {

  var when        = options.when         || function() { return true; },
  map             = options.map          || function () { return Array.prototype.slice.call(arguments, 0); },
  target          = options.target       || bindable,
  max             = options.max          || (options.once ? 1 : undefined) || -1,
  tos             = toarray(options.to).concat(),
  previousValues  = toarray(options.defaultValue),
  toProperties    = [],
  bothWays        = options.bothWays;

  
  if (!when.test && typeof when === "function") {
    when = { test: when };
  }

  if (!previousValues.length) {
    previousValues.push(undefined)
  }

  if (!tos.length) {
    throw new Error("missing 'to' option");
  }

  for (var i = tos.length; i--;) {
    var to = tos[i],
    tot    = typeof to;

    /*
     need to convert { property: { map: fn}} to another transformed value, which is
     { map: fn, to: property }
     */

    if (tot === "object") {

      // "to" might have multiple properties we're binding to, so 
      // add them to the END of the array of "to" items
      for (var property in to) {

        // assign the property to the 'to' parameter
        to[property].to = property;
        tos.push(transform(target, fromProperty, to[property]));
      }

      // remove the item, since we just added new items to the end
      tos.splice(i, 1);

    // might be a property we're binding to
    } else if(tot === "string") {
      toProperties.push(to);
      tos[i] = wrapFn(getToPropertyFn(target, to), previousValues, max);
    } else if (tot === "function") {
      tos[i] = wrapFn(to, previousValues, max);
    } else {
      throw new Error("'to' must be a function");
    }
  }

  // two-way data-binding
  if (bothWays) {
    for (var i = toProperties.length; i--;) {
      target.bind(toProperties[i], { to: fromProperty });
    }
  }

  // newValue, newValue2, oldValue, oldValue2
  return function () {

    var values = toarray(map.apply(this, arguments));

    // first make sure that we don't trigger the old value
    if (!when.test.apply(when, values)) return;

    for (var i = tos.length; i--;) {
      tos[i].apply(this, values);
    }
  };
};

module.exports = transform;
},{"toarray":55,"underscore":66}],50:[function(require,module,exports){
var _     = require("underscore"),
transform = require("./transform"),
options   = require("../utils/options");

/**
 * bindable.bind("a", fn);
 */

function watchSimple (bindable, property, fn) {

  bindable.emit("watching", [property]);

  var listener = bindable.on("change:" + property, function () {
    fn.apply(self, arguments);
  }), self;

  return self = {
    target: bindable,
    now: function () {
      fn.call(self, bindable.get(property));
      return self;
    },
    dispose: function () {
      listener.dispose();
    }
  }
}

/**
 * bindable.bind("a.b.c.d.e", fn);
 */


function watchChain (bindable, hasComputed, chain, fn) {

  var listeners = [], values = hasComputed ? [] : undefined, self;

  function onChange () {
    dispose();
    listeners = [];
    values = hasComputed ? [] : undefined;
    bind(bindable, chain);
    self.now();
  }


  if (hasComputed && typeof window !== "undefined") {
    onChange = _.debounce(onChange, 1);
  }

  function bind (target, chain, pushValues) {

    var currentChain = [], subValue, currentProperty, j, computed, hadComputed, pv, cv = chain.length ? target.__context : target;

    // need to run through all variations of the property chain incase it changes
    // in the bindable.object. For instance:
    // target.bind("a.b.c", fn); 
    // triggers on
    // target.set("a", obj);
    // target.set("a.b", obj);
    // target.set("a.b.c", obj);

    // does it have @each in there? could be something like
    // target.bind("friends.@each.name", function (names) { })
    if (hasComputed) {

      for (var i = 0, n = chain.length; i < n; i++) {

        currentChain.push(chain[i]);
        currentProperty = chain[i];

        target.emit("watching", currentChain);

        // check for @ at the beginning
        if (computed = (currentProperty.charCodeAt(0) === 64)) {
          hadComputed = true;
          // remove @ - can't be used to fetch the propertyy
          currentChain[i] = currentProperty = currentChain[i].substr(1);
        }
        
        pv = cv;
        if (cv) cv = cv[currentProperty];

        // check if 
        if (computed && cv) {


          // used in cases where the collection might change that would affect 
          // this binding. length for instance on the collection...
          if (cv.compute) {
            for (var j = cv.compute.length; j--;) {
              bind(target, [cv.compute[j]], false);
            }
          }

          // the sub chain for each of the items from the loop
          var eachChain = chain.slice(i + 1);

          // call the function, looping through items
          cv.call(pv, function (item) {

            if (!item) return;

            // wrap around bindable object as a helper
            if (!item.__isBindable) {
              item = new module.exports.BindableObject(item);
            }

            bind(item, eachChain, pushValues);
          });
          break;
        } else if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
          cv = cv.__context;
        }

        listeners.push(target.on("change:" +  currentChain.join("."), onChange));

      } 

      if (!hadComputed && pushValues !== false) {
        values.push(cv);
      }

    } else {

      for (var i = 0, n = chain.length; i < n; i++) {
        currentProperty = chain[i];
        currentChain.push(currentProperty);

        target.emit("watching", currentChain);

        if (cv) cv = cv[currentProperty];

        // pass the watch onto the bindable object, but also listen 
        // on the current target for any
        if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
          cv = cv.__context;
        }

        listeners.push(target.on("change:" + currentChain.join("."), onChange));
        
      }

      if (pushValues !== false) values = cv;
    }


  }

  function dispose () {
    if (!listeners) return;
    for (var i = listeners.length; i--;) {
      listeners[i].dispose();
    }
    listeners = undefined;
  }

  bind(bindable, chain);

  return self = {
    target: bindable,
    now: function () {
      fn.call(self, values);
      return self;
    },
    dispose: dispose
  }
}

/**
 */

function watchMultiple (bindable, chains, fn) { 

  var values = new Array(chains.length),
  oldValues  = new Array(chains.length),
  bindings   = new Array(chains.length),
  fn2        = options.computedDelay === -1 ? fn : _.debounce(fn, options.computedDelay),
  self;

  chains.forEach(function (chain, i) {

    function onChange (value, oldValue) {
      values[i]    = value;
      oldValues[i] = oldValue;
      fn2.apply(this, values.concat(oldValues));
    }

    bindings[i] = bindable.bind(chain, onChange);
  });

  return self = {
    target: bindable,
    now: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].now();
      }
      return self;
    },
    dispose: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].dispose();
      }
    }
  }
}

/**
 */

function watchProperty (bindable, property, fn) {

  if (typeof fn === "object") {
    fn = transform(bindable, property, fn);
  }

  // TODO - check if is an array
  var chain;

  if (typeof property === "string") {
    if (~property.indexOf(",")) {
      return watchMultiple(bindable, property.split(/[,\s]+/), fn);
    } else if (~property.indexOf(".")) {
      chain = property.split(".");
    } else {
      chain = [property];
    }
  } else {
    chain = property;
  }

  // collection.bind("length")
  if (chain.length === 1) {
    return watchSimple(bindable, property, fn);

  // person.bind("city.zip")
  } else {
    return watchChain(bindable, ~property.indexOf("@"), chain, fn);
  }
}

module.exports = watchProperty;
},{"../utils/options":52,"./transform":49,"underscore":66}],51:[function(require,module,exports){
var toarray = require("toarray");

module.exports = function (properties, fn) {
  properties = toarray(properties);
  fn.compute = properties;
  return fn;
};
},{"toarray":55}],52:[function(require,module,exports){
module.exports = {
  computedDelay : 0
};

},{}],53:[function(require,module,exports){


(function() {

	var _disposable = {};
		


	_disposable.create = function() {
		
		var self = {},
		disposables = [];


		self.add = function(disposable) {

			if(arguments.length > 1) {
				var collection = _disposable.create();
				for(var i = arguments.length; i--;) {
					collection.add(arguments[i]);
				}
				return self.add(collection);
			}

			if(typeof disposable == 'function') {
				
				var disposableFunc = disposable, args = Array.prototype.slice.call(arguments, 0);

				//remove the func
				args.shift();


				disposable = {
					dispose: function() {
						disposableFunc.apply(null, args);
					}
				};
			} else 
			if(!disposable || !disposable.dispose) {
				return false;
			}


			disposables.push(disposable);

			return {
				dispose: function() {
					var i = disposables.indexOf(disposable);
					if(i > -1) disposables.splice(i, 1);
				}
			};
		};

		self.addTimeout = function(timerId) {
			return self.add(function() {
				clearTimeout(timerId);
			});
		};

		self.addInterval = function(timerId) {
			return self.add(function() {
				clearInterval(timerId);
			});
		};

		self.addBinding = function(target) {
			self.add(function() {
				target.unbind();
			});
		};



		self.dispose = function() {
			
			for(var i = disposables.length; i--;) {
				disposables[i].dispose();
			}

			disposables = [];
		};

		return self;
	}



	if(typeof module != 'undefined') {
		module.exports = _disposable;
	}
	else
	if(typeof window != 'undefined') {
		window.disposable = _disposable;
	}


})();


},{}],54:[function(require,module,exports){
/*
 * Sift
 * 
 * Copryright 2011, Craig Condon
 * Licensed under MIT
 *
 * Inspired by mongodb's query language 
 */


(function() {


	/**
	 */

	var _convertDotToSubObject = function(keyParts, value) {

		var subObject = {},
		currentValue = subObject;

		for(var i = 0, n = keyParts.length - 1; i < n; i++) {
			currentValue = currentValue[keyParts[i]] = {};
		}

		currentValue[keyParts[i]] = value;
		
		return subObject;
	}

	/**
	 */

	var _queryParser = new (function() {

		/**
		 * tests against data
		 */

		var priority = this.priority = function(statement, data) {

			var exprs = statement.exprs,
			priority = 0;

			//generally, expressions are ordered from least efficient, to most efficient.
			for(var i = 0, n = exprs.length; i < n; i++) {

				var expr = exprs[i],
				p;

				if(!~(p = expr.e(expr.v, _comparable(data), data))) return -1;

				priority += p;

			}


			return priority;
		}


		/**
		 * parses a statement into something evaluable
		 */

		var parse = this.parse = function(statement, key) {

			//fixes sift(null, []) issue
			if(!statement) statement = { $eq: statement };

			var testers = [];
				
			//if the statement is an object, then we're looking at something like: { key: match }
			if(statement.constructor == Object) {

				for(var k in statement) {

					//find the apropriate operator. If one doesn't exist, then it's a property, which means
					//we create a new statement (traversing) 
					var operator = !!_testers[k] ?  k : '$trav',

					//value of given statement (the match)
					value = statement[k],

					//default = match
					exprValue = value;

					//if we're working with a traversable operator, then set the expr value
					if(TRAV_OP[operator]) {


						//using dot notation? convert into a sub-object
						if(~k.indexOf(".")) {
							var keyParts = k.split(".");
							k = keyParts.shift(); //we're using the first key, so remove it

							exprValue = value = _convertDotToSubObject(keyParts, value);
						}
						
						//*if* the value is an array, then we're dealing with something like: $or, $and
						if(value instanceof Array) {
							
							exprValue = [];

							for(var i = value.length; i--;) {
								exprValue.push(parse(value[i]));		
							}

						//otherwise we're dealing with $trav
						} else {	
							exprValue = parse(value, k);
						}
					} 

					testers.push(_getExpr(operator, k, exprValue));

				}
								

			//otherwise we're comparing a particular value, so set to eq
			} else {
				testers.push(_getExpr('$eq', k, statement));
			}

			var stmt =  { 
				exprs: testers,
				k: key,
				test: function(value) {
					return !!~stmt.priority(value);
				},
				priority: function(value) {
					return priority(stmt, value);
				}
			};
			
			return stmt;
		
		}


		//traversable statements
		var TRAV_OP = this.traversable = {
			$and: true,
			$or: true,
			$nor: true,
			$trav: true,
			$not: true
		};


		function _comparable(value) {
			if(value instanceof Date) {
				return value.getTime();
			} else {
				return value;
			}
		}

		function btop(value) {
			return value ? 0 : -1;
		}

		var _testers = this.testers =  {

			/**
			 */

			$eq: function(a, b) {
				return btop(a.test(b));
			},

			/**
			 */

			$ne: function(a, b) {
				return btop(!a.test(b));
			},

			/**
			 */

			$lt: function(a, b) {
				return btop(a > b);
			},

			/**
			 */

			$gt: function(a, b) {
				return btop(a < b);
			},

			/**
			 */

			$lte: function(a, b) {
				return btop(a >= b);
			},

			/**
			 */

			$gte: function(a, b) {
				return btop(a <= b);
			},


			/**
			 */

			$exists: function(a, b) {
				return btop(a === (b != null))
			},

			/**
			 */

			$in: function(a, b) {

				//intersecting an array
				if(b instanceof Array) {

					for(var i = b.length; i--;) {
						if(~a.indexOf(b[i])) return i;
					}	

				} else {
					return btop(~a.indexOf(b));
				}


				return -1;
			},

			/**
			 */

			$not: function(a, b) {
				if(!a.test) throw new Error("$not test should include an expression, not a value. Use $ne instead.");
				return btop(!a.test(b));
			},

			/**
			 */

			$type: function(a, b, org) {

				//instanceof doesn't work for strings / boolean. instanceof works with inheritance
				return org ? btop(org instanceof a || org.constructor == a) : -1;
			},

			/**
			 */


			$nin: function(a, b) {
				return ~_testers.$in(a, b) ? -1 : 0;
			},

			/**
			 */

			$mod: function(a, b) {
				return b % a[0] == a[1] ? 0 : -1;
			},

			/**
			 */

			$all: function(a, b) {

				for(var i = a.length; i--;) {
					if(b.indexOf(a[i]) == -1) return -1;
				}

				return 0;
			},

			/**
			 */

			$size: function(a, b) {
				return b ? btop(a == b.length) : -1;
			},

			/**
			 */

			$or: function(a, b) {

				var i = a.length, p, n = i;

				for(; i--;) {
					if(~priority(a[i], b)) {
						return i;
					}
				}

				return btop(n == 0);
			},

			/**
			 */

			$nor: function(a, b) {

				var i = a.length, n = i;

				for(; i--;) {
					if(~priority(a[i], b)) {
						return -1;
					}
				}

				return 0;
			},

			/**
			 */

			$and: function(a, b) {

				for(var i = a.length; i--;) {
					if(!~priority(a[i], b)) {
						return -1;
					}
				}

				return 0;
			},

			/**
			 */

			$trav: function(a, b) {



				if(b instanceof Array) {
					
					for(var i = b.length; i--;) {
						var subb = b[i];
						if(subb[a.k] && ~priority(a, subb[a.k])) return i;
					}

					return -1;
				}

				//continue to traverse even if there isn't a value - this is needed for 
				//something like name:{$exists:false}
				return priority(a, b ? b[a.k] : undefined);
			}
		}

		var _prepare = {
			
			/**
			 */

			$eq: function(a) {
				
				var fn;

				if(a instanceof RegExp) {
					return a;
				} else if (a instanceof Function) {
					fn = a;
				} else {
					
					fn = function(b) {	
						if(b instanceof Array) {		
							return ~b.indexOf(a);
						} else {
							return a == b;
						}
					}
				}

				return {
					test: fn
				}

			},
			
			/**
			 */
				
			 $ne: function(a) {
				return _prepare.$eq(a);
			 }
		};



		var _getExpr = function(type, key, value) {

			var v = _comparable(value);

			return { 

				//k key
				k: key, 

				//v value
				v: _prepare[type] ? _prepare[type](v) : v, 

				//e eval
				e: _testers[type] 
			};

		}

	})();


	var getSelector = function(selector) {

		if(!selector) {

			return function(value) {
				return value;
			};

		} else 
		if(typeof selector == 'function') {
			return selector;
		}

		throw new Error("Unknown sift selector " + selector);
	}

	var sifter = function(query, selector) {

		//build the filter for the sifter
		var filter = _queryParser.parse( query );
			
		//the function used to sift through the given array
		var self = function(target) {
				
			var sifted = [], results = [], value, priority;

			//I'll typically start from the end, but in this case we need to keep the order
			//of the array the same.
			for(var i = 0, n = target.length; i < n; i++) {

				value = selector(target[i]);

				//priority = -1? it's not something we can use.
				if(!~(priority = filter.priority( value ))) continue;

				//push all the sifted values to be sorted later. This is important particularly for statements
				//such as $or
				sifted.push({
					value: value,
					priority: priority
				});
			}

			//sort the values
			sifted.sort(function(a, b) {
				return a.priority > b.priority ? -1 : 1;
			});

			var values = Array(sifted.length);

			//finally, fetch the values & return them.
			for(var i = sifted.length; i--;) {
				values[i] = sifted[i].value;
			}

			return values;
		}

		//set the test function incase the sifter isn't needed
		self.test   = filter.test;
		self.score = filter.priority;
		self.query  = query;

		return self;
	}


	/**
	 * sifts the given function
	 * @param query the mongodb query
	 * @param target the target array
	 * @param rawSelector the selector for plucking data from the given target
	 */

	var sift = function(query, target, rawSelector) {

		//must be an array
		if(typeof target != "object") {
			rawSelector = target;
			target = undefined;
		}


		var sft  = sifter(query, getSelector(rawSelector));

		//target given? sift through it and return the filtered result
		if(target) return sft(target);

		//otherwise return the sifter func
		return sft;

	}


	sift.use = function(options) {
		if(options.operators) sift.useOperators(options.operators);
	}

	sift.useOperators = function(operators) {
		for(var key in operators) {
			sift.useOperator(key, operators[key]);
		}
	}

	sift.useOperator = function(operator, optionsOrFn) {

		var options = {};

		if(typeof optionsOrFn == "object") {
			options = optionsOrFn;
		} else {
			options = { test: optionsOrFn };
		}


		var key = "$" + operator;
		_queryParser.testers[key] = options.test;

		if(options.traversable || options.traverse) {
			_queryParser.traversable[key] = true;
		}
	}


	//node.js?
	if((typeof module != 'undefined') && (typeof module.exports != 'undefined')) {
		
		module.exports = sift;

	} else 

	//browser?
	if(typeof window != 'undefined') {
		
		window.sift = sift;

	}

})();


},{}],55:[function(require,module,exports){
module.exports = function(item) {
  if(item === undefined)  return [];
  return Object.prototype.toString.call(item) === "[object Array]" ? item : [item];
}
},{}],56:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],57:[function(require,module,exports){
(function (global){
var _gss = global._gss = global._gss || [],
type = require("type-component");

/**
 */

var _gs = function(context) {
	for(var i = _gss.length; i--;) {
		var gs = _gss[i];
		if(gs.test(context)) {
			return gs;
		}
	}
}

/**
 */

var _length = function(context) {
	var gs = _gs(context);

	return gs ? gs.length(context) : context.length;
}


/**
 */

var _get = function(context, key) {

	var gs = _gs(context);

	return gs ? gs.get(context, key) : context[key];
}


/**
 */

var _set = function(context, key, value) {

	var gs = _gs(context);

	return gs ? gs.set(context, key, value) : (context[key] = value);
}

/**
 * finds references
 */

var _findValues = function(keyParts, target, create, index, values) {

	if(!values) {
		keyParts = (type(keyParts) === "array" ? keyParts : keyParts.split(".")).filter(function(part) {
			return !!part.length;
		})
		values = [];
		index = 0;
	}

	var ct, j, kp, i = index, n = keyParts.length, pt = target;


	for(;i < n; i++) {
		kp = keyParts[i];
		ct = _get(pt, kp);


		if(kp == '$') {

			for(j = _length(pt); j--;) {
				_findValues(keyParts, _get(pt, j), create, i + 1, values);
			}
			return values;
		} else
		if(ct == undefined || ct == null) {
			if(!create) return values;
			_set(pt, kp, { });
			ct = _get(pt, kp);
		}

		pt = ct;
	}

	if(ct) {
		values.push(ct);
	} else {
		values.push(pt);
	}

	return values;
}


/**
 */

var getValue = function(target, key) {
	key = String(key);
	var values =  _findValues(key, target);

	return key.indexOf('.$.') == -1 ? values[0] : values;
}

/**
 */

var setValue = function(target, key, newValue) {
	key = String(key);
	var keyParts = key.split("."),
	keySet = keyParts.pop();

	if(keySet == '$') {
		keySet = keyParts.pop();
	}

	var values = _findValues(keyParts, target, true);


	for(var i = values.length; i--;) {
		// values[i][keySet] = newValue;
		_set(values[i], keySet, newValue);
	}

}


exports.get = getValue;
exports.set = setValue;
exports.use = function(gs) {
	_gss.push(gs);
}



}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"type-component":65}],58:[function(require,module,exports){
var protoclass = require("protoclass"),
nofactor       = require("nofactor");

// TODO - figure out a way to create a document fragment in the constructor
// instead of calling toFragment() each time. perhaps 
var Section = function (nodeFactory, start, end) {

  this.nodeFactory = nodeFactory = nodeFactory || nofactor["default"];

  // create invisible markers so we know where the sections are

  this.start       = start || nodeFactory.createTextNode("");
  this.end         = end   || nodeFactory.createTextNode("");
  this.visible     = true;

  if (!this.start.parentNode) {
    var parent  = nodeFactory.createFragment();
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

  remove: function () {
    // this removes the child nodes completely
    return this.nodeFactory.createFragment(this.getChildNodes());
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
   */

  append: function () {
    this._insertAfter(Array.prototype.slice.call(arguments, 0), this.end.previousSibling);
  },

  /**
   */

  prepend: function () {
    this._insertAfter(Array.prototype.slice.call(arguments, 0), this.start);
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
      return node.outerHTML || (node.nodeValue != undefined ? node.nodeValue : String(node));
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

  _insertAfter: function(newNodes, refNode) {
    if(!newNodes.length) return;

    if(newNodes.length > 1) {
      newNodes = this.nodeFactory.createFragment(newNodes);
    } else {
      newNodes = newNodes[0];
    }

    return refNode.parentNode.insertBefore(newNodes, refNode.nextSibling);
  },

  /**
   */

  _section: function (children) {
    var section = new Section(this.nodeFactory);
    section.append.apply(section, children);
    return section;
  }
});

module.exports = function (nodeFactory, start, end)  {
  return new Section(nodeFactory, start, end);
}
},{"nofactor":62,"protoclass":64}],59:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseFactory () {

}

protoclass(BaseFactory, {

  /**
   */

  createElement: function (element) { },

  /**
   */

  createFragment: function () { },

  /**
   */

  createComment: function (value) { },

  /**
   */

  createTextNode: function (value) { },

  /**
   */

  parseHtml: function (content) { }
});



module.exports = BaseFactory;

},{"protoclass":64}],60:[function(require,module,exports){
var Base = require("./base");

function DomFactory () {

}


Base.extend(DomFactory, {

  /**
   */

  name: "dom",

  /**
   */

  createElement: function (name) {
    return document.createElement(name);
  },

  /**
   */

  createComment: function (value) {
    return document.createComment(value);
  },

  /**
   */

  createTextNode: function (value) {
    return document.createTextNode(value);
  },

  /**
   */

  createFragment: function (children) {

    if (!children) children = [];

    var frag = document.createDocumentFragment()

    var childrenToArray = [];

    for (var i = 0, n = children.length; i < n; i++) {
      childrenToArray.push(children[i]);
    }

    for(var j = 0, n2 = childrenToArray.length; j < n2; j++) {
      frag.appendChild(childrenToArray[j]);
    }

    return frag;
  }
});

module.exports = new DomFactory();
},{"./base":59}],61:[function(require,module,exports){
// from node-ent

var entities = {
  "<"  : "lt",
  "&"  : "amp",
  ">"  : "gt",
  "\"" : "quote"
};

module.exports = function (str) {
  str = String(str);

  return str.split("").map(function(c) {

    var e = entities[c],
    cc    = c.charCodeAt(0);

    if (e) {
      return "&" + e + ";";
    } else if (c.match(/\s/)) {
      return c;
    } else if(cc < 32 || cc > 126) {
      return "&#" + cc + ";";
    }

    return c;

  }).join("");
}
},{}],62:[function(require,module,exports){
module.exports = {
  string : require("./string"),
  dom    : require("./dom")
};

module.exports["default"] = typeof window !== "undefined" ? module.exports.dom : module.exports.string;
},{"./dom":60,"./string":63}],63:[function(require,module,exports){
var ent     = require("./ent"),
Base        = require("./base"),
protoclass  = require("protoclass");


function Node () {

}

protoclass(Node, {
  __isNode: true
});


function Container () {
  this.childNodes = [];
}

protoclass(Node, Container, {

  /**
   */

  appendChild: function (node) {

    if (node.nodeType === 11 && node.childNodes.length) {
      while (node.childNodes.length) {
        this.appendChild(node.childNodes[0]);
      }
      return;
    }

    this._unlink(node);
    this.childNodes.push(node);
    this._link(node);
  },

  /**
   */

  prependChild: function (node) {
    if (!this.childNodes.length) {
      this.appendChild(node);
    } else {
      this.insertBefore(node, this.childNodes[0]);
    }
  },

  /**
   */

  removeChild: function (child) {
    var i = this.childNodes.indexOf(child);

    if (!~i) return;

    this.childNodes.splice(i, 1);

    if (child.previousSibling) child.previousSibling.nextSibling = child.nextSibling;
    if (child.nextSibling)     child.nextSibling.previousSibling = child.previousSibling;

    delete child.parentNode;
    delete child.nextSibling;
    delete child.previousSibling;
  },

  /**
   */

  insertBefore: function (newElement, before) {

    if (newElement.nodeType === 11) {
      var before, node;
      for (var i = newElement.childNodes.length; i--;) {
        this.insertBefore(node = newElement.childNodes[i], before);
        before = node;
      }
    }

    this._splice(this.childNodes.indexOf(before), 0, newElement);
  },

  /**
   */

  _splice: function (index, count, node) {

    if (typeof index === "undefined") index = -1;
    if (!~index) return;

    if (node) this._unlink(node);
    
    this.childNodes.splice.apply(this.childNodes, arguments);

    if (node) this._link(node);
  },

  /**
   */

  _unlink: function (node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  },

  /**
   */

  _link: function (node) {

    if (!node.__isNode) {
      throw new Error("cannot append non-node ");
    }

    node.parentNode = this;
    var i = this.childNodes.indexOf(node);

    // FFox compatible
    if (i !== 0)                         node.previousSibling = this.childNodes[i - 1];
    if (i != this.childNodes.length - 1) node.nextSibling     = this.childNodes[i + 1];

    if (node.previousSibling) node.previousSibling.nextSibling = node;
    if (node.nextSibling)     node.nextSibling.previousSibling = node;
  }
});



function Style () {

}

protoclass(Style, {

  /**
   */

  _hasStyle: false,

  /**
   */


  setProperty: function(key, value) {

    if (value === "" || value == undefined) {
      delete this[key];
      return;
    }

    this[key] = value;
  },

  /**
   */

  parse: function (styles) {
    var styleParts = styles.split(/;\s*/);

    for (var i = 0, n = styleParts.length; i < n; i++) {
      var sp = styleParts[i].split(/:\s*/);

      if (sp[1] == undefined || sp[1] == "") {
        continue;
      }

      this[sp[0]] = sp[1];
    }
  },

  /**
   */

  toString: function () {
    var buffer = [];
    for (var key in this) {
      if(this.constructor.prototype[key] !== undefined) continue;

      var v = this[key];

      if (v === "") {
        continue;
      }

      buffer.push(key + ": " + this[key]);
    }

    if(!buffer.length) return "";

    return buffer.join("; ") + ";"
  },

  /**
   */

  hasStyles: function () {
    if(this._hasStyle) return true;

    for (var key in this) {
      if (this[key] != undefined && this.constructor.prototype[key] == undefined) {
        return this._hasStyle = true;
      }
    }

    return false;
  }
});


function Element (nodeName) {
  Element.superclass.call(this);

  this.nodeName    = nodeName.toUpperCase();
  this._name       = nodeName.toLowerCase();
  this.attributes  = [];
  this._attrsByKey = {};
  this.style       = new Style();

}

protoclass(Container, Element, {

  /**
   */

  nodeType: 3,

  /**
   */

  setAttribute: function (name, value) {
    name = name.toLowerCase();

    if (name === "style") {
      return this.style.parse(value);
    }

    if (value == undefined) {
      return this.removeAttribute(name);
    }

    var abk;

    if (!(abk = this._attrsByKey[name])) {
      this.attributes.push(abk = this._attrsByKey[name] = {})
    }

    abk.name  = name;
    abk.value = value;
  },

  /**
   */

  removeAttribute: function (name) {

    for (var i = this.attributes.length; i--;) {
      var attr = this.attributes[i];
      if (attr.name == name) {
        this.attributes.splice(i, 1);
        break;
      }
    }

    delete this._attrsByKey[name];
  },

  /**
   */

  getAttribute: function (name) {
    var abk;
    if(abk = this._attrsByKey[name]) return abk.value;
  },

  /**
   */

  toString: function () {

    var buffer = ["<", this._name],
    attribs    =  [],
    attrbuff;

    for (var name in this._attrsByKey) {

      var v    = this._attrsByKey[name].value;
      attrbuff = name;

      if (name != undefined) {
        attrbuff += "=\"" + v + "\"";
      }

      attribs.push(attrbuff);
    }

    if (this.style.hasStyles()) {
      attribs.push("style=" + "\"" + this.style.toString() + "\"");
    }

    if (attribs.length) {
      buffer.push(" ", attribs.join(" "));
    }

    buffer.push(">");
    buffer.push.apply(buffer, this.childNodes);
    buffer.push("</", this._name, ">");

    return buffer.join("");
  },

  /**
   */

  cloneNode: function () {
    var clone = new Element(this.nodeName);

    for (var key in this._attrsByKey) {
      clone.setAttribute(key, this._attrsByKey[key].value);
    }

    clone.setAttribute("style", this.style.toString());

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    return clone;
  }
});


function Text (value, encode) {
  this.replaceText(value, encode);
}

protoclass(Node, Text, {

  /**
   */

  nodeType: 3,

  /**
   */

  toString: function () {
    return this.nodeValue;
  },

  /**
   */

  cloneNode: function () {
    return new Text(this.nodeValue);
  },

  /**
   */ 

  replaceText: function (value, encode) {
    this.nodeValue = encode ? ent(value) : value;
  }
});

function Comment () {
  Comment.superclass.apply(this, arguments);
}

protoclass(Text, Comment, {

  /**
   */

  nodeType: 8,

  /**
   */

  toString: function () {
    return "<!--" + Comment.__super__.toString.call(this) + "-->";
  },

  /**
   */

  cloneNode: function () {
    return new Comment(this.nodeValue);
  }
});

function Fragment () {
  Fragment.superclass.call(this);
}

protoclass(Container, Fragment, {

  /**
   */

  nodeType: 11,

  /**
   */

  toString: function () {
    return this.childNodes.join("");
  },

  /**
   */

  cloneNode: function () {
    var clone = new Fragment();

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    return clone;
  }
});

function StringNodeFactory (context) {
  this.context = context;
}

protoclass(Base, StringNodeFactory, {

  /**
   */

  name: "string",

  /**
   */

  createElement: function (name) {
    return new Element(name);
  },

  /**
   */

  createTextNode: function (value, encode) {
    return new Text(value, encode);
  },

  /**
   */

  createComment: function (value) {
    return new Comment(value);
  },

  /**
   */

  createFragment: function (children) {

    if (!children) children = [];
    var frag = new Fragment(),
    childrenToArray = Array.prototype.slice.call(children, 0);

    for (var i = 0, n = childrenToArray.length; i < n; i++) {
      frag.appendChild(childrenToArray[i]);
    }

    return frag;
  },

  /**
   */

  parseHtml: function (buffer) {

    //this should really parse HTML, but too much overhead
    return this.createTextNode(buffer);
  }
});

module.exports = new StringNodeFactory();
},{"./base":59,"./ent":61,"protoclass":64}],64:[function(require,module,exports){
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
  child.parent = child.superclass = parent;

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
  }

  return child;
}


module.exports = protoclass;
},{}],65:[function(require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],66:[function(require,module,exports){
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}]},{},[1])