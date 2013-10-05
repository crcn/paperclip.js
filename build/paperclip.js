(function() {
    var modules = {}, definitions = {};
    var _require = function(path) {
        if (modules[path]) return modules[path];
        var module = {
            exports: {}
        }, definition = definitions[path];
        if (!definition) {
            try {
                return require(path);
            } catch (e) {}
            throw new Error("unable to load " + path);
        }
        return modules[path] = module.exports = definition(_require, module, module.exports, path);
    };
    var define = function(path, definition) {
        definitions[path] = definition;
    };
    if (typeof global == "undefined") {
        global = window;
    }
    if (typeof window == "undefined") {
        global.window = global;
    }
    if (typeof window.process == "undefined") {
        window.process = {};
    }
    if (typeof document == "undefined") {
        global.document = global;
    }
    if (typeof document.documentElement == "undefined") {
        document.documentElement = {};
    }
    if (typeof document.documentElement.style == "undefined") {
        document.documentElement.style = {};
    }
    if (typeof navigator == "undefined") {
        global.navigator = global;
    }
    if (typeof navigator.userAgent == "undefined") {
        navigator.userAgent = "sardines";
    }
    if (typeof navigator.platform == "undefined") {
        navigator.platform = "sardines";
    }
    define("paperclip/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var Clip, paper;
        Clip = require("paperclip/lib/clip/index.js");
        paper = require("paperclip/lib/paper/index.js");
        module.exports = paper;
        if (typeof window !== "undefined") {
            window.paperclip = module.exports;
        }
        return module.exports;
    });
    define("paperclip/lib/clip/index.js", function(require, module, exports, __dirname, __filename) {
        var Clip, ClipScript, ClipScripts, PropertyChain, bindable, dref, events, type, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        dref = require("dref/lib/index.js");
        events = require("events/index.js");
        bindable = require("bindable/lib/index.js");
        type = require("type-component/index.js");
        PropertyChain = function() {
            PropertyChain.prototype.__isPropertyChain = true;
            function PropertyChain(watcher) {
                this.watcher = watcher;
                this._commands = [];
                this.clip = this.watcher.clip;
            }
            PropertyChain.prototype.ref = function(path) {
                this._commands.push({
                    ref: path
                });
                return this;
            };
            PropertyChain.prototype.castAs = function(name) {
                this.watcher.cast[name] = this;
                return this;
            };
            PropertyChain.prototype.path = function() {
                var c, path, _i, _len, _ref;
                path = [];
                _ref = this._commands;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    c = _ref[_i];
                    path.push(c.ref);
                }
                return path.join(".");
            };
            PropertyChain.prototype.self = function(path) {
                this._self = true;
                this.ref(path);
                return this;
            };
            PropertyChain.prototype.call = function(path, args) {
                this._commands.push({
                    ref: path,
                    args: args
                });
                return this;
            };
            PropertyChain.prototype.exec = function() {
                this.currentValue = this.value();
                return this;
            };
            PropertyChain.prototype.value = function(value) {
                var command, cv, hasValue, i, n, pv, _i, _len, _ref;
                hasValue = arguments.length;
                cv = this._self ? this.clip : this.clip.data;
                n = this._commands.length;
                _ref = this._commands;
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    command = _ref[i];
                    if (cv.__isBindable) {
                        this.watcher._watch(command.ref, cv);
                    }
                    if (i === n - 1 && hasValue) {
                        if (cv.set) {
                            cv.set(command.ref, value);
                        } else {
                            dref.set(cv, command.ref, value);
                        }
                    }
                    pv = cv;
                    cv = cv.get ? cv.get(command.ref) : dref.get(cv, command.ref);
                    if (command.args) {
                        if (cv && typeof cv === "function") {
                            cv = cv != null ? cv.apply(pv, command.args) : void 0;
                        } else {
                            cv = void 0;
                        }
                    }
                    if (!cv) {
                        break;
                    }
                }
                return cv;
            };
            return PropertyChain;
        }();
        ClipScript = function(_super) {
            __extends(ClipScript, _super);
            function ClipScript(script, clip) {
                this.script = script;
                this.clip = clip;
                this._debounceUpdate = __bind(this._debounceUpdate, this);
                this.update = __bind(this.update, this);
                this.options = this.clip.options;
                this._watching = {};
                this.cast = {};
            }
            ClipScript.prototype.dispose = function() {
                var key;
                for (key in this._watching) {
                    this._watching[key].dispose();
                }
                return this._watching = {};
            };
            ClipScript.prototype.update = function() {
                var newValue;
                newValue = this.script.fn.call(this);
                if (newValue === this.value) {
                    return newValue;
                }
                this._updated = true;
                this.emit("change", this.value = newValue);
                return newValue;
            };
            ClipScript.prototype.watch = function() {
                this.__watch = true;
                return this;
            };
            ClipScript.prototype.unwatch = function() {
                var key;
                this.__watch = false;
                for (key in this._watching) {
                    this._watching[key].dispose();
                }
                this._watching = {};
                return this;
            };
            ClipScript.prototype.references = function() {
                return this.script.refs || [];
            };
            ClipScript.prototype.ref = function(path) {
                return (new PropertyChain(this)).ref(path);
            };
            ClipScript.prototype.self = function(path) {
                return (new PropertyChain(this)).self(path);
            };
            ClipScript.prototype.call = function(path, args) {
                return (new PropertyChain(this)).call(path, args);
            };
            ClipScript.prototype.castAs = function(name) {
                return (new PropertyChain(this)).castAs(name);
            };
            ClipScript.prototype._watch = function(path, target) {
                var binding, lockUpdate, _this = this;
                if (!this.__watch) {
                    return;
                }
                if (this._watching[path]) {
                    if (this._watching[path].target === target) {
                        return;
                    }
                    this._watching[path].dispose();
                }
                lockUpdate = true;
                this._watching[path] = {
                    target: target,
                    binding: binding = target.bind(path).to(function(value, oldValue) {
                        if (value != null ? value.__isBindable : void 0) {
                            _this._watchBindable(value, oldValue);
                        } else if (type(value) === "function") {
                            _this._spyFunction(path, value, target);
                        }
                        if (lockUpdate) {
                            return;
                        }
                        return _this.update();
                    }).now(),
                    dispose: function() {
                        return binding.dispose();
                    }
                };
                return lockUpdate = false;
            };
            ClipScript.prototype._watchBindable = function(value, oldValue) {
                var onChange, _this = this;
                value.on("change", onChange = function() {
                    if (!_this._updated) {
                        return;
                    }
                    return _this._debounceUpdate();
                });
                return {
                    disposeBinding: function() {
                        return value.off("change", onChange);
                    }
                };
            };
            ClipScript.prototype._spyFunction = function(path, fn, target) {
                var oldFn, ref, self, _i, _len, _ref;
                oldFn = fn;
                if (fn.__isCallSpy) {
                    return;
                }
                self = this;
                target = (typeof target.owner === "function" ? target.owner(path) : void 0) || target;
                if (fn.refs) {
                    _ref = fn.refs;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        ref = _ref[_i];
                        this._watch(ref, target);
                    }
                } else {}
            };
            ClipScript.prototype._debounceUpdate = function() {
                clearTimeout(this._debounceTimeout);
                return this._debounceTimeout = setTimeout(this.update, 0);
            };
            return ClipScript;
        }(events.EventEmitter);
        ClipScripts = function() {
            function ClipScripts(clip, scripts) {
                this.clip = clip;
                this._scripts = {};
                this.names = [];
                this._bindScripts(scripts);
            }
            ClipScripts.prototype.watch = function() {
                var key;
                for (key in this._scripts) {
                    this._scripts[key].watch();
                }
                return this;
            };
            ClipScripts.prototype.unwatch = function() {
                var key;
                for (key in this._scripts) {
                    this._scripts[key].unwatch();
                }
                return this;
            };
            ClipScripts.prototype.update = function() {
                var key;
                for (key in this._scripts) {
                    this._scripts[key].update();
                }
                return this;
            };
            ClipScripts.prototype.dispose = function() {
                var key;
                for (key in this._scripts) {
                    this._scripts[key].dispose();
                }
                return this._scripts = {};
            };
            ClipScripts.prototype.get = function(name) {
                return this._scripts[name];
            };
            ClipScripts.prototype._bindScripts = function(scripts) {
                var scriptName;
                if (scripts.fn) {
                    this._bindScript("value", scripts);
                } else {
                    for (scriptName in scripts) {
                        this._bindScript(scriptName, scripts[scriptName]);
                    }
                }
            };
            ClipScripts.prototype._bindScript = function(name, script, watch) {
                var clipScript, _this = this;
                this.names.push(name);
                clipScript = new ClipScript(script, this.clip);
                this._scripts[name] = clipScript;
                return clipScript.on("change", function(value) {
                    return _this.clip.set(name, value);
                });
            };
            return ClipScripts;
        }();
        Clip = function() {
            function Clip(options) {
                var scripts;
                this.options = options;
                this._self = this.context = options.context || new bindable.Object;
                this.reset(options.data, false);
                scripts = this.options.scripts || this.options.script;
                if (scripts) {
                    this.scripts = new ClipScripts(this, scripts);
                }
                if (options.watch !== false) {
                    this.watch();
                }
            }
            Clip.prototype.reset = function(data, update) {
                if (data == null) {
                    data = {};
                }
                if (update == null) {
                    update = true;
                }
                this.data = data.__isBindable ? data : new bindable.Object(data);
                if (update) {
                    this.update();
                }
                return this;
            };
            Clip.prototype.watch = function() {
                this.scripts.watch();
                return this;
            };
            Clip.prototype.unwatch = function() {
                return this.scripts.unwatch();
            };
            Clip.prototype.update = function() {
                this.scripts.update();
                return this;
            };
            Clip.prototype.dispose = function() {
                var _ref, _ref1;
                if ((_ref = this._self) != null) {
                    _ref.dispose();
                }
                return (_ref1 = this.scripts) != null ? _ref1.dispose() : void 0;
            };
            Clip.prototype.script = function(name) {
                return this.scripts.get(name);
            };
            Clip.prototype.get = function() {
                var _ref;
                return (_ref = this._self).get.apply(_ref, arguments);
            };
            Clip.prototype.set = function() {
                var _ref;
                return (_ref = this._self).set.apply(_ref, arguments);
            };
            Clip.prototype.bind = function() {
                var _ref;
                return (_ref = this._self).bind.apply(_ref, arguments);
            };
            return Clip;
        }();
        module.exports = Clip;
        return module.exports;
    });
    define("paperclip/lib/paper/index.js", function(require, module, exports, __dirname, __filename) {
        var Clip, bindable, bindings, modifiers, nofactor, template;
        Clip = require("paperclip/lib/clip/index.js");
        template = require("paperclip/lib/paper/template.js");
        nofactor = require("nofactor/lib/index.js");
        modifiers = require("paperclip/lib/paper/modifiers.js");
        bindings = require("paperclip/lib/paper/bindings/index.js");
        bindable = require("bindable/lib/index.js");
        module.exports = {
            Clip: Clip,
            bindable: bindable,
            template: template,
            modifier: function(name, modifier) {
                return modifiers[name] = modifier;
            },
            BaseBlockBinding: bindings.BaseBlockBinding,
            BaseNodeBinding: bindings.BaseNodeBinding,
            BaseAttrDataBinding: bindings.BaseAttrDataBinding,
            blockBinding: bindings.blockBindingFactory.register,
            nodeBinding: bindings.nodeBindingFactory.register,
            attrDataBinding: bindings.nodeBindingFactory.dataBind.register,
            use: function(fn) {
                return fn(this);
            }
        };
        return module.exports;
    });
    define("dref/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var _gss = global._gss = global._gss || [], type = require("type-component/index.js");
        var _gs = function(context) {
            for (var i = _gss.length; i--; ) {
                var gs = _gss[i];
                if (gs.test(context)) {
                    return gs;
                }
            }
        };
        var _length = function(context) {
            var gs = _gs(context);
            return gs ? gs.length(context) : context.length;
        };
        var _get = function(context, key) {
            var gs = _gs(context);
            return gs ? gs.get(context, key) : context[key];
        };
        var _set = function(context, key, value) {
            var gs = _gs(context);
            return gs ? gs.set(context, key, value) : context[key] = value;
        };
        var _findValues = function(keyParts, target, create, index, values) {
            if (!values) {
                keyParts = (type(keyParts) === "array" ? keyParts : keyParts.split(".")).filter(function(part) {
                    return !!part.length;
                });
                values = [];
                index = 0;
            }
            var ct, j, kp, i = index, n = keyParts.length, pt = target;
            for (; i < n; i++) {
                kp = keyParts[i];
                ct = _get(pt, kp);
                if (kp == "$") {
                    for (j = _length(pt); j--; ) {
                        _findValues(keyParts, _get(pt, j), create, i + 1, values);
                    }
                    return values;
                } else if (ct == undefined || ct == null) {
                    if (!create) return values;
                    _set(pt, kp, {});
                    ct = _get(pt, kp);
                }
                pt = ct;
            }
            if (ct) {
                values.push(ct);
            } else {
                values.push(pt);
            }
            return values;
        };
        var getValue = function(target, key) {
            key = String(key);
            var values = _findValues(key, target);
            return key.indexOf(".$.") == -1 ? values[0] : values;
        };
        var setValue = function(target, key, newValue) {
            key = String(key);
            var keyParts = key.split("."), keySet = keyParts.pop();
            if (keySet == "$") {
                keySet = keyParts.pop();
            }
            var values = _findValues(keyParts, target, true);
            for (var i = values.length; i--; ) {
                _set(values[i], keySet, newValue);
            }
        };
        exports.get = getValue;
        exports.set = setValue;
        exports.use = function(gs) {
            _gss.push(gs);
        };
        return module.exports;
    });
    define("events/index.js", function(require, module, exports, __dirname, __filename) {
        var isArray = Array.isArray;
        function EventEmitter() {}
        exports.EventEmitter = EventEmitter;
        var defaultMaxListeners = 100;
        EventEmitter.prototype.setMaxListeners = function(n) {
            if (!this._events) this._events = {};
            this._events.maxListeners = n;
        };
        EventEmitter.prototype.emit = function() {
            var type = arguments[0];
            if (type === "error") {
                if (!this._events || !this._events.error || isArray(this._events.error) && !this._events.error.length) {
                    if (arguments[1] instanceof Error) {
                        throw arguments[1];
                    } else {
                        throw new Error("Uncaught, unspecified 'error' event.");
                    }
                    return false;
                }
            }
            if (!this._events) return false;
            var handler = this._events[type];
            if (!handler) return false;
            if (typeof handler == "function") {
                switch (arguments.length) {
                  case 1:
                    handler.call(this);
                    break;
                  case 2:
                    handler.call(this, arguments[1]);
                    break;
                  case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;
                  default:
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    handler.apply(this, args);
                }
                return true;
            } else if (isArray(handler)) {
                var l = arguments.length;
                var args = new Array(l - 1);
                for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                var listeners = handler.slice();
                for (var i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].apply(this, args);
                }
                return true;
            } else {
                return false;
            }
        };
        EventEmitter.prototype.addListener = function(type, listener) {
            if ("function" !== typeof listener) {
                throw new Error("addListener only takes instances of Function");
            }
            if (!this._events) this._events = {};
            this.emit("newListener", type, listener);
            if (!this._events[type]) {
                this._events[type] = listener;
            } else if (isArray(this._events[type])) {
                this._events[type].push(listener);
                if (!this._events[type].warned) {
                    var m;
                    if (this._events.maxListeners !== undefined) {
                        m = this._events.maxListeners;
                    } else {
                        m = defaultMaxListeners;
                    }
                    if (m && m > 0 && this._events[type].length > m) {
                        this._events[type].warned = true;
                        console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                        console.trace();
                    }
                }
            } else {
                this._events[type] = [ this._events[type], listener ];
            }
            return this;
        };
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.once = function(type, listener) {
            if ("function" !== typeof listener) {
                throw new Error(".once only takes instances of Function");
            }
            var self = this;
            function g() {
                self.removeListener(type, g);
                listener.apply(this, arguments);
            }
            g.listener = listener;
            self.on(type, g);
            return this;
        };
        EventEmitter.prototype.removeListener = function(type, listener) {
            if ("function" !== typeof listener) {
                throw new Error("removeListener only takes instances of Function");
            }
            if (!this._events || !this._events[type]) return this;
            var list = this._events[type];
            if (isArray(list)) {
                var position = -1;
                for (var i = 0, length = list.length; i < length; i++) {
                    if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                        position = i;
                        break;
                    }
                }
                if (position < 0) return this;
                list.splice(position, 1);
                if (list.length == 0) delete this._events[type];
            } else if (list === listener || list.listener && list.listener === listener) {
                delete this._events[type];
            }
            return this;
        };
        EventEmitter.prototype.removeAllListeners = function(type) {
            if (arguments.length === 0) {
                this._events = {};
                return this;
            }
            if (type && this._events && this._events[type]) this._events[type] = null;
            return this;
        };
        EventEmitter.prototype.listeners = function(type) {
            if (!this._events) this._events = {};
            if (!this._events[type]) this._events[type] = [];
            if (!isArray(this._events[type])) {
                this._events[type] = [ this._events[type] ];
            }
            return this._events[type];
        };
        return module.exports;
    });
    define("bindable/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Binding;
            Binding = require("bindable/lib/object/binding.js");
            exports.Object = require("bindable/lib/object/index.js");
            exports.Collection = require("bindable/lib/collection/index.js");
            exports.EventEmitter = require("bindable/lib/core/eventEmitter.js");
            exports.computed = require("bindable/lib/utils/computed.js");
            exports.options = require("bindable/lib/utils/options.js");
            Binding.Collection = exports.Collection;
        }).call(this);
        return module.exports;
    });
    define("type-component/index.js", function(require, module, exports, __dirname, __filename) {
        var toString = Object.prototype.toString;
        module.exports = function(val) {
            switch (toString.call(val)) {
              case "[object Function]":
                return "function";
              case "[object Date]":
                return "date";
              case "[object RegExp]":
                return "regexp";
              case "[object Arguments]":
                return "arguments";
              case "[object Array]":
                return "array";
            }
            if (val === null) return "null";
            if (val === undefined) return "undefined";
            if (val === Object(val)) return "object";
            return typeof val;
        };
        return module.exports;
    });
    define("paperclip/lib/paper/template.js", function(require, module, exports, __dirname, __filename) {
        var Loader, Template, nofactor, tpl;
        nofactor = require("nofactor/lib/index.js");
        Loader = require("paperclip/lib/paper/loader.js");
        Template = function() {
            function Template(paper, nodeFactory) {
                this.paper = paper;
                this.nodeFactory = nodeFactory;
            }
            Template.prototype.bind = function(context) {
                return (new Loader(this)).load(context).bind();
            };
            return Template;
        }();
        Template.prototype.creator = module.exports = tpl = function(paperOrSrc, nodeFactory) {
            var paper;
            if (nodeFactory == null) {
                nodeFactory = nofactor["default"];
            }
            if (typeof paperOrSrc === "string") {
                if (!tpl.compiler) {
                    throw new Error("template must be a function");
                }
                paper = tpl.compiler.compile(paperOrSrc, {
                    eval: true
                });
            } else {
                paper = paperOrSrc;
            }
            return new Template(paper, nodeFactory);
        };
        return module.exports;
    });
    define("nofactor/lib/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = {
            string: require("nofactor/lib/string.js"),
            dom: require("nofactor/lib/dom.js")
        };
        module.exports["default"] = typeof window !== "undefined" ? module.exports.dom : module.exports.string;
        return module.exports;
    });
    define("paperclip/lib/paper/modifiers.js", function(require, module, exports, __dirname, __filename) {
        module.exports = {
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
            }
        };
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = {
            BaseBlockBinding: require("paperclip/lib/paper/bindings/block/base.js"),
            blockBindingFactory: require("paperclip/lib/paper/bindings/block/factory.js"),
            nodeBindingFactory: require("paperclip/lib/paper/bindings/node/factory.js"),
            BaseNodeBinding: require("paperclip/lib/paper/bindings/node/base/index.js"),
            BaseAttrDataBinding: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js")
        };
        return module.exports;
    });
    define("bindable/lib/object/binding.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableSetter, Binding, DeepPropertyWatcher, bindableSetter, options, toarray, type, utils, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            BindableSetter = require("bindable/lib/object/setters/factory.js");
            bindableSetter = new BindableSetter;
            utils = require("bindable/lib/core/utils.js");
            options = require("bindable/lib/utils/options.js");
            toarray = require("toarray/index.js");
            DeepPropertyWatcher = require("bindable/lib/object/deepPropertyWatcher.js");
            type = require("type-component/index.js");
            module.exports = Binding = function() {
                Binding.prototype.__isBinding = true;
                function Binding(_from, properties) {
                    this._from = _from;
                    this.now = __bind(this.now, this);
                    this._properties = properties.split(/[,\s]+/g);
                    this._limit = -1;
                    this._delay = this._properties.length === 1 ? options.delay : options.computedDelay;
                    this._setters = [];
                    this._cvalues = [];
                    this._listeners = [];
                    this._triggerCount = 0;
                    this.map(function(value) {
                        return value;
                    });
                    this._listen();
                }
                Binding.prototype.now = function() {
                    var hasChanged, listener, nvalues, setter, _i, _j, _len, _len1, _ref, _ref1;
                    nvalues = [];
                    _ref = this._listeners;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        listener = _ref[_i];
                        nvalues.push(listener.value());
                    }
                    hasChanged = false;
                    _ref1 = this._setters;
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                        setter = _ref1[_j];
                        hasChanged = setter.change(nvalues) || hasChanged;
                    }
                    if (hasChanged && ~this._limit && ++this._triggerCount >= this._limit) {
                        this.dispose();
                    }
                    return this;
                };
                Binding.prototype.collection = function() {
                    if (this._collectionBinding) {
                        return this._collectionBinding;
                    }
                    this._collection = new Binding.Collection;
                    this.to(this._collection.source);
                    this.now();
                    return this._collectionBinding = this._collection.bind().copyId(true);
                };
                Binding.prototype.to = function(target, property, now) {
                    var setter;
                    if (now == null) {
                        now = false;
                    }
                    setter = bindableSetter.createSetter(this, target, property);
                    if (setter) {
                        this._setters.push(setter);
                        if (now === true) {
                            setter.now();
                        }
                    }
                    return this;
                };
                Binding.prototype.from = function(from, property) {
                    if (arguments.length === 1) {
                        property = from;
                        from = this._from;
                    }
                    return from.bind(property).to(this._from, this._properties);
                };
                Binding.prototype.map = function(options) {
                    if (!arguments.length) {
                        return this._map;
                    }
                    this._map = utils.transformer(options);
                    return this;
                };
                Binding.prototype.once = function() {
                    return this.limit(1);
                };
                Binding.prototype.limit = function(count) {
                    this._limit = count;
                    return this;
                };
                Binding.prototype.isBothWays = function() {
                    return !!this._boundBothWays;
                };
                Binding.prototype.bothWays = function() {
                    var setter, _i, _len, _ref;
                    if (this._boundBothWays) {
                        return this;
                    }
                    this._boundBothWays = true;
                    _ref = this._setters;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        setter.bothWays();
                    }
                    return this;
                };
                Binding.prototype.delay = function(value) {
                    if (!arguments.length) {
                        return this._delay;
                    }
                    this._delay = value;
                    this._listen();
                    return this;
                };
                Binding.prototype.dispose = function() {
                    var setter, _i, _len, _ref;
                    _ref = this._setters;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        setter.dispose();
                    }
                    this._setters = [];
                    if (this._collectionBinding) {
                        this._collectionBinding.dispose();
                    }
                    this._dlisteners();
                    return this;
                };
                Binding.prototype._dlisteners = function() {
                    var disposeListener, listener, _i, _j, _len, _len1, _ref, _ref1;
                    if (this._listeners) {
                        _ref = this._listeners;
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            listener = _ref[_i];
                            listener.dispose();
                        }
                    }
                    if (this._disposeListeners) {
                        _ref1 = this._disposeListeners;
                        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                            disposeListener = _ref1[_j];
                            disposeListener.dispose();
                        }
                    }
                    this._listeners = [];
                    return this._disposeListeners = [];
                };
                Binding.prototype._listen = function() {
                    var disposeListeners, listeners, property, _i, _len, _ref, _this = this;
                    this._dlisteners();
                    listeners = [];
                    disposeListeners = [];
                    _ref = this._properties;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        property = _ref[_i];
                        listeners.push(new DeepPropertyWatcher({
                            binding: this,
                            target: this._from,
                            path: property.split("."),
                            callback: this.now,
                            index: 0,
                            delay: this._delay
                        }));
                        disposeListeners.push(this._from.once("dispose", function() {
                            return _this.dispose();
                        }));
                    }
                    this._disposeListeners = disposeListeners;
                    return this._listeners = listeners;
                };
                return Binding;
            }();
            Binding.fromOptions = function(target, options) {
                var binding, t, to, tops, _i, _len, _ref;
                binding = target.bind(options.from || options.property);
                if (type(options.to) === "object") {
                    for (to in options.to) {
                        tops = options.to[to];
                        if (tops.transform || tops.map) {
                            binding.map(tops.transform || tops.map);
                        }
                        if (tops.now) {
                            binding.now();
                        }
                        if (tops.bothWays) {
                            binding.bothWays();
                        }
                        binding.to(to);
                    }
                } else {
                    options.to = toarray(options.to);
                    _ref = options.to;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        t = _ref[_i];
                        tops = typeof t === "object" ? t : {
                            property: t
                        };
                        if (tops.transform || tops.map) {
                            bindings.map(tops.transform || tops.map);
                        }
                        binding.to(tops.property);
                    }
                }
                if (options.limit) {
                    binding.limit(options.limit);
                }
                if (options.once) {
                    binding.once();
                }
                if (options.bothWays) {
                    binding.bothWays();
                }
                if (options.now) {
                    binding.now();
                }
                return binding;
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Bindable, Binding, EventEmitter, dref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            dref = require("bindable/lib/object/dref.js");
            EventEmitter = require("bindable/lib/core/eventEmitter.js");
            Binding = require("bindable/lib/object/binding.js");
            module.exports = Bindable = function(_super) {
                __extends(Bindable, _super);
                Bindable.prototype.__isBindable = true;
                function Bindable(data) {
                    Bindable.__super__.constructor.call(this);
                    this._initData(data);
                    this._bindings = [];
                }
                Bindable.prototype._initData = function(data) {
                    this.data = data != null ? data : {};
                };
                Bindable.prototype._watching = function(property) {};
                Bindable.prototype.get = function(key, flatten) {
                    var firstProp, keyParts, ret;
                    if (flatten == null) {
                        flatten = false;
                    }
                    ret = dref.get(this.data, key, flatten);
                    if (ret != null) {
                        return ret;
                    }
                    keyParts = key.split(".");
                    firstProp = keyParts.shift();
                    ret = dref.get(this[firstProp], keyParts.join("."), flatten);
                    if (ret != null) {
                        dref.set(this, firstProp, ret);
                    }
                    return ret;
                };
                Bindable.prototype.toObject = function(key) {
                    return this.get(key, true);
                };
                Bindable.prototype.getFlatten = function(key) {
                    return this.toObject(key);
                };
                Bindable.prototype.keys = function() {
                    return Object.keys(this.getFlatten());
                };
                Bindable.prototype.has = function(key) {
                    return !!this.get(key);
                };
                Bindable.prototype.set = function(key, value) {
                    var k, _i, _len, _ref;
                    if (arguments.length === 1) {
                        if (key.__isBindable) {
                            _ref = key.keys();
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                k = _ref[_i];
                                this.set(k, key.get(k));
                            }
                            return;
                        }
                        for (k in key) {
                            this.set(k, key[k]);
                        }
                        return;
                    }
                    return this._set(key, value);
                };
                Bindable.prototype.reset = function(newData) {
                    var key;
                    if (newData == null) {
                        newData = {};
                    }
                    this.set(newData);
                    for (key in this.data) {
                        if (dref.get(newData, key) == null) {
                            this.set(key, void 0);
                        }
                    }
                    return this;
                };
                Bindable.prototype._set = function(key, value) {
                    if (!dref.set(this, key, value)) {
                        return this;
                    }
                    this.emit("change:" + key, value);
                    this.emit("change", key, value);
                    return this;
                };
                Bindable.prototype._ref = function(context, key) {
                    if (!key) {
                        return context;
                    }
                    dref.get(context, key);
                    return this;
                };
                Bindable.prototype.bind = function(property, to) {
                    if (typeof property === "object") {
                        return Binding.fromOptions(this, property);
                    }
                    if (to && to.__isBinding) {
                        this.set(property, to);
                        return;
                    }
                    return (new Binding(this, property)).to(to);
                };
                Bindable.prototype.dispose = function() {
                    return this.emit("dispose");
                };
                Bindable.prototype.toJSON = function() {
                    return this.data;
                };
                return Bindable;
            }(EventEmitter);
            module.exports.EventEmitter = EventEmitter;
            module.exports.propertyWatcher = require("bindable/lib/object/deepPropertyWatcher.js");
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableObject, Binding, EventEmitter, computed, dref, hoist, type, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            dref = require("dref/lib/index.js");
            Binding = require("bindable/lib/collection/binding.js");
            EventEmitter = require("bindable/lib/core/eventEmitter.js");
            type = require("type-component/index.js");
            hoist = require("hoist/lib/index.js");
            BindableObject = require("bindable/lib/object/index.js");
            computed = require("bindable/lib/utils/computed.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                _Class.prototype.__isCollection = true;
                function _Class(source, _id) {
                    if (source == null) {
                        source = [];
                    }
                    if (_id == null) {
                        _id = "_id";
                    }
                    this._enforceItemId = __bind(this._enforceItemId, this);
                    this.reset = __bind(this.reset, this);
                    this.source = __bind(this.source, this);
                    _Class.__super__.constructor.call(this);
                    this._source = [];
                    if (type(source) === "string") {
                        _id = source;
                        source = [];
                    }
                    this._length = 0;
                    this._id(_id);
                    this.__enforceId = false;
                    this.transform().postMap(this._enforceItemId);
                    this.reset(source);
                }
                _Class.prototype.empty = function() {
                    return !this._length;
                };
                _Class.prototype.length = function() {
                    return this._length;
                };
                _Class.prototype.source = function(value) {
                    if (!arguments.length) {
                        return this._source;
                    }
                    return this.reset(value);
                };
                _Class.prototype.reset = function(source) {
                    if (!source) {
                        source = [];
                    }
                    this.disposeSourceBinding();
                    this._remove(this._source || []);
                    if (source.__isCollection) {
                        this._source = [];
                        this._id(source._id());
                        this._sourceBinding = source.bind().to(this).now();
                        return this;
                    }
                    this._insert(this._source = this._transform(source));
                    this._resetInfo();
                    return this;
                };
                _Class.prototype.disposeSourceBinding = function() {
                    if (this._sourceBinding) {
                        this._sourceBinding.dispose();
                        return this._sourceBinding = void 0;
                    }
                };
                _Class.prototype.bind = function(to) {
                    if (type(to) === "string") {
                        return _Class.__super__.bind.apply(this, arguments);
                    }
                    return (new Binding(this)).to(to);
                };
                _Class.prototype.set = function(key, value) {
                    var k;
                    k = Number(key);
                    if (isNaN(k)) {
                        return _Class.__super__.set.apply(this, arguments);
                    }
                    return this.splice(k, value);
                };
                _Class.prototype.get = function(key) {
                    var k;
                    k = Number(key);
                    if (isNaN(k)) {
                        return _Class.__super__.get.call(this, key);
                    }
                    return this.at(k);
                };
                _Class.prototype.at = function(index) {
                    return this._source[index];
                };
                _Class.prototype.first = function() {
                    return this._source[0];
                };
                _Class.prototype.last = function() {
                    return this._source[this._length - 1];
                };
                _Class.prototype.update = function(item) {};
                _Class.prototype.remove = function(item) {
                    var index;
                    index = this.indexOf(item);
                    if (!~index) {
                        return false;
                    }
                    this.splice(index, 1);
                    return true;
                };
                _Class.prototype.filter = function(cb) {
                    return this._source.filter(cb);
                };
                _Class.prototype.each = computed("length", function(fn) {
                    var item, _i, _len, _ref, _results;
                    _ref = this._source;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        _results.push(fn(item));
                    }
                    return _results;
                });
                _Class.prototype.splice = function(index, count) {
                    var args, remove;
                    args = Array.prototype.slice.call(arguments);
                    args.splice(0, 2);
                    args = this._transform(args);
                    remove = this.slice(index, index + count);
                    this._source.splice.apply(this._source, arguments);
                    this._remove(remove, index);
                    return this._insert(args, index);
                };
                _Class.prototype.transform = function() {
                    return this._transformer || (this._transformer = hoist());
                };
                _Class.prototype.slice = function(start, end) {
                    return this._source.slice(start, end);
                };
                _Class.prototype.indexOf = function(searchItem) {
                    var i, item, _i, _len, _ref;
                    _ref = this._source;
                    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                        item = _ref[i];
                        if (this._get(item, this.__id) === this._get(searchItem, this.__id)) {
                            return i;
                        }
                    }
                    return -1;
                };
                _Class.prototype._get = function(item, id) {
                    var _ref;
                    if (!item) {
                        return void 0;
                    }
                    return (_ref = typeof item.get === "function" ? item.get(id) : void 0) != null ? _ref : item[id];
                };
                _Class.prototype._id = function(key) {
                    if (!arguments.length) {
                        return this.__id;
                    }
                    if (this.__id === key) {
                        return this;
                    }
                    this.__id = key;
                    if (this._source) {
                        this._enforceId();
                    }
                    return this;
                };
                _Class.prototype.push = function() {
                    var items;
                    items = this._transform(Array.prototype.slice.call(arguments));
                    this._source.push.apply(this._source, items);
                    return this._insert(items, this._length);
                };
                _Class.prototype.unshift = function() {
                    var items;
                    items = this._transform(Array.prototype.slice.call(arguments));
                    this._source.unshift.apply(this._source, items);
                    return this._insert(items);
                };
                _Class.prototype.toJSON = function() {
                    var item, source, _i, _len, _ref;
                    source = [];
                    _ref = this._source;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        source.push((typeof item.toJSON === "function" ? item.toJSON() : void 0) || item);
                    }
                    return source;
                };
                _Class.prototype.pop = function() {
                    return this._remove([ this._source.pop() ], this._length)[0];
                };
                _Class.prototype.shift = function() {
                    return this._remove([ this._source.shift() ], 0)[0];
                };
                _Class.prototype.enforceId = function(value) {
                    if (!arguments.length) {
                        return this.__enforceId;
                    }
                    return this.__enforceId = value;
                };
                _Class.prototype._enforceId = function() {
                    var item, _i, _len, _ref, _results;
                    _ref = this._source;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        _results.push(this._enforceItemId(item));
                    }
                    return _results;
                };
                _Class.prototype._enforceItemId = function(item) {
                    var _id;
                    if (!this.__enforceId) {
                        return item;
                    }
                    _id = this._get(item, this.__id);
                    if (_id === void 0 || _id === null) {
                        throw new Error("item '" + item + "' must have a '" + this.__id + "'");
                    }
                    return item;
                };
                _Class.prototype._insert = function(items, start) {
                    var i, item, _i, _len;
                    if (start == null) {
                        start = 0;
                    }
                    if (!items.length) {
                        return;
                    }
                    this._length += items.length;
                    this._resetInfo();
                    for (i = _i = 0, _len = items.length; _i < _len; i = ++_i) {
                        item = items[i];
                        this.emit("insert", item, start + i);
                    }
                    return items;
                };
                _Class.prototype._remove = function(items, start) {
                    var i, item, _i, _len;
                    if (start == null) {
                        start = 0;
                    }
                    if (!items.length) {
                        return;
                    }
                    this._length -= items.length;
                    this._resetInfo();
                    for (i = _i = 0, _len = items.length; _i < _len; i = ++_i) {
                        item = items[i];
                        this.emit("remove", item, start + i);
                    }
                    return items;
                };
                _Class.prototype._resetInfo = function() {
                    this.set("length", this._length);
                    return this.set("empty", !this._length);
                };
                _Class.prototype._transform = function(item, index, start) {
                    var i, results, _i, _len;
                    if (!this._transformer) {
                        return item;
                    }
                    if (type(item) === "array") {
                        results = [];
                        for (_i = 0, _len = item.length; _i < _len; _i++) {
                            i = item[_i];
                            results.push(this._transformer(i));
                        }
                        return results;
                    }
                    return this._transformer(item);
                };
                return _Class;
            }(BindableObject);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/core/eventEmitter.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var EventEmitter, disposable, events, type, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            events = require("events/index.js");
            disposable = require("disposable/lib/index.js");
            type = require("type-component/index.js");
            module.exports = EventEmitter = function(_super) {
                __extends(EventEmitter, _super);
                function EventEmitter() {
                    _ref = EventEmitter.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                EventEmitter.prototype.on = function(key, listener) {
                    var disposables, k, keys, listeners, _this = this;
                    disposables = disposable.create();
                    if (arguments.length === 1) {
                        listeners = key;
                        for (k in listeners) {
                            disposables.add(this.on(k, listeners[k]));
                        }
                        return disposables;
                    }
                    keys = [];
                    if (typeof key === "string") {
                        keys = key.split(" ");
                    } else {
                        keys = key;
                    }
                    keys.forEach(function(key) {
                        EventEmitter.__super__.on.call(_this, key, listener);
                        return disposables.add(function() {
                            return _this.off(key, listener);
                        });
                    });
                    return disposables;
                };
                EventEmitter.prototype.once = function(key, listener) {
                    var disp, oldListener;
                    oldListener = listener;
                    if (type(listener) !== "function") {
                        throw new Error("listener must be a function");
                    }
                    disp = this.on(key, function() {
                        disp.dispose();
                        return oldListener.apply(this, arguments);
                    });
                    disp.target = this;
                    return disp;
                };
                EventEmitter.prototype.off = function(key, listener) {
                    return this.removeListener(key, listener);
                };
                return EventEmitter;
            }(events.EventEmitter);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/utils/computed.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var toarray;
            toarray = require("toarray/index.js");
            module.exports = function(properties, fn) {
                properties = toarray(properties);
                fn.refs = properties;
                return fn;
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/utils/options.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            module.exports = {
                delay: -1,
                computedDelay: 0
            };
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/loader.js", function(require, module, exports, __dirname, __filename) {
        var BindingCollection, BlockWriter, ElementWriter, FragmentWriter, Loader, ParseWriter, TextWriter, bindable, loaf, modifiers;
        modifiers = require("paperclip/lib/paper/modifiers.js");
        FragmentWriter = require("paperclip/lib/paper/writers/fragment.js");
        BlockWriter = require("paperclip/lib/paper/writers/block.js");
        TextWriter = require("paperclip/lib/paper/writers/text.js");
        ElementWriter = require("paperclip/lib/paper/writers/element.js");
        ParseWriter = require("paperclip/lib/paper/writers/parse.js");
        BindingCollection = require("paperclip/lib/paper/bindings/collection.js");
        bindable = require("bindable/lib/index.js");
        loaf = require("loaf/lib/index.js");
        Loader = function() {
            Loader.prototype.__isLoader = true;
            function Loader(template) {
                this.template = template;
                this.nodeFactory = template.nodeFactory;
                this.paper = template.paper;
                this.bindings = new BindingCollection;
                this._writers = {
                    fragment: new FragmentWriter(this),
                    block: new BlockWriter(this),
                    text: new TextWriter(this),
                    element: new ElementWriter(this),
                    parse: new ParseWriter(this)
                };
            }
            Loader.prototype.load = function(context) {
                var node;
                if (context == null) {
                    context = {};
                }
                if (!context.__isBindable) {
                    context = new bindable.Object(context);
                }
                this.context = context;
                node = this.paper(this._writers.fragment.write, this._writers.block.write, this._writers.element.write, this._writers.text.write, this._writers.parse.write, modifiers);
                this.section = loaf();
                this.section.append(node);
                return this;
            };
            Loader.prototype.bind = function() {
                this.bindings.bind(this.context);
                return this;
            };
            Loader.prototype.dispose = function() {
                this.unbind();
                this.section.dispose();
                return this;
            };
            Loader.prototype.unbind = function() {
                this.bindings.unbind();
                return this;
            };
            Loader.prototype.toFragment = function() {
                return this.section.toFragment();
            };
            Loader.prototype.toString = function() {
                var div, frag;
                if (this.nodeFactory.name === "string") {
                    return this.section.toString();
                }
                frag = this.section.toFragment();
                div = document.createElement("div");
                div.appendChild(frag.cloneNode(true));
                return div.innerHTML;
            };
            return Loader;
        }();
        module.exports = Loader;
        return module.exports;
    });
    define("nofactor/lib/string.js", function(require, module, exports, __dirname, __filename) {
        var Comment, Container, Element, Fragment, Node, StringNodeFactory, Style, Text, bindable, ent, _ref, _ref1, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        bindable = require("bindable/lib/index.js");
        ent = require("nofactor/lib/ent.js");
        Node = function() {
            function Node() {}
            Node.prototype.__isNode = true;
            return Node;
        }();
        Container = function(_super) {
            __extends(Container, _super);
            function Container() {
                this.childNodes = [];
            }
            Container.prototype.appendChild = function(node) {
                var child, _i, _len, _ref;
                if (node.nodeType === 11) {
                    _ref = node.childNodes.concat();
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        this.appendChild(child);
                    }
                    return;
                }
                this._unlink(node);
                this.childNodes.push(node);
                return this._link(node);
            };
            Container.prototype.prependChild = function(node) {
                if (!this.childNodes.length) {
                    return this.appendChild(node);
                } else {
                    return this.insertBefore(node, this.childNodes[0]);
                }
            };
            Container.prototype.removeChild = function(child) {
                var i, _ref, _ref1;
                i = this.childNodes.indexOf(child);
                if (!~i) {
                    return;
                }
                this.childNodes.splice(i, 1);
                if ((_ref = child.previousSibling) != null) {
                    _ref.nextSibling = child.nextSibling;
                }
                if ((_ref1 = child.nextSibling) != null) {
                    _ref1.previousSibling = child.previousSibling;
                }
                return child.parentNode = child.nextSibling = child.previousSibling = void 0;
            };
            Container.prototype.insertBefore = function(newElement, before) {
                var node, _i, _len, _ref;
                if (newElement.nodeType === 11) {
                    _ref = newElement.childNodes.concat().reverse();
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        node = _ref[_i];
                        this.insertBefore(node, before);
                        before = node;
                    }
                    return;
                }
                return this._splice(this.childNodes.indexOf(before), 0, newElement);
            };
            Container.prototype._splice = function(index, count, node) {
                var _ref;
                if (index == null) {
                    index = -1;
                }
                if (!~index) {
                    return;
                }
                if (node) {
                    this._unlink(node);
                }
                (_ref = this.childNodes).splice.apply(_ref, arguments);
                if (node) {
                    return this._link(node);
                }
            };
            Container.prototype._unlink = function(node) {
                if (node.parentNode) {
                    return node.parentNode.removeChild(node);
                }
            };
            Container.prototype._link = function(node) {
                var i, _ref, _ref1;
                if (!node.__isNode) {
                    throw new Error("cannot append non-node");
                }
                node.parentNode = this;
                i = this.childNodes.indexOf(node);
                node.previousSibling = i !== 0 ? this.childNodes[i - 1] : void 0;
                node.nextSibling = i !== this.childNodes.length - 1 ? this.childNodes[i + 1] : void 0;
                if ((_ref = node.previousSibling) != null) {
                    _ref.nextSibling = node;
                }
                return (_ref1 = node.nextSibling) != null ? _ref1.previousSibling = node : void 0;
            };
            return Container;
        }(Node);
        Style = function() {
            Style.prototype._hasStyle = false;
            function Style() {}
            Style.prototype.setProperty = function(key, value) {
                if (value == null) {
                    value = "";
                }
                if (value === "") {
                    delete this[key];
                    return;
                }
                return this[key] = value;
            };
            Style.prototype.parse = function(styles) {
                var sp, style, _i, _len, _ref, _results;
                _ref = styles.split(/;\s*/);
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    style = _ref[_i];
                    sp = style.split(/:\s*/);
                    if (sp[1] == null || sp[1] === "") {
                        continue;
                    }
                    _results.push(this[sp[0]] = sp[1]);
                }
                return _results;
            };
            Style.prototype.toString = function() {
                var buffer, key, v;
                buffer = [];
                for (key in this) {
                    if (this.constructor.prototype[key] != null) {
                        continue;
                    }
                    v = this[key];
                    if (v === "") {
                        continue;
                    }
                    buffer.push("" + key + ": " + this[key]);
                }
                if (!buffer.length) {
                    return "";
                }
                return buffer.join("; ") + ";";
            };
            Style.prototype.hasStyles = function() {
                var key;
                if (this._hasStyle) {
                    return true;
                }
                for (key in this) {
                    if (this[key] != null && this.constructor.prototype[key] == null) {
                        return this._hasStyle = true;
                    }
                }
                return false;
            };
            return Style;
        }();
        Element = function(_super) {
            __extends(Element, _super);
            Element.prototype.nodeType = 3;
            function Element(nodeName) {
                Element.__super__.constructor.call(this);
                this.nodeName = nodeName.toUpperCase();
                this._name = nodeName.toLowerCase(0);
                this.attributes = [];
                this._attrsByKey = {};
                this.style = new Style;
            }
            Element.prototype.setAttribute = function(name, value) {
                var abk;
                name = name.toLowerCase();
                if (name === "style") {
                    return this.style.parse(value);
                }
                if (value === void 0) {
                    return this.removeAttribute(name);
                }
                if (!(abk = this._attrsByKey[name])) {
                    this.attributes.push(abk = this._attrsByKey[name] = {});
                }
                abk.name = name;
                return abk.value = value;
            };
            Element.prototype.removeAttribute = function(name) {
                var attr, i, _i, _len, _ref;
                _ref = this.attributes;
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    attr = _ref[i];
                    if (attr.name === name) {
                        this.attributes.splice(i, 1);
                        break;
                    }
                }
                return delete this._attrsByKey[name];
            };
            Element.prototype.getAttribute = function(name) {
                var _ref;
                return (_ref = this._attrsByKey[name]) != null ? _ref.value : void 0;
            };
            Element.prototype.toString = function() {
                var attrbuff, attribs, buffer, name, v;
                buffer = [ "<", this._name ];
                attribs = [];
                for (name in this._attrsByKey) {
                    v = this._attrsByKey[name].value;
                    attrbuff = name;
                    if (v != null) {
                        attrbuff += '="' + v + '"';
                    }
                    attribs.push(attrbuff);
                }
                if (this.style.hasStyles()) {
                    attribs.push('style="' + this.style.toString() + '"');
                }
                if (attribs.length) {
                    buffer.push(" ", attribs.join(" "));
                }
                buffer.push(">");
                buffer.push.apply(buffer, this.childNodes);
                buffer.push("</", this._name, ">");
                return buffer.join("");
            };
            return Element;
        }(Container);
        Text = function(_super) {
            __extends(Text, _super);
            Text.prototype.nodeType = 3;
            function Text(value) {
                this.value = ent(value);
            }
            Text.prototype.toString = function() {
                return this.value;
            };
            return Text;
        }(Node);
        Comment = function(_super) {
            __extends(Comment, _super);
            function Comment() {
                _ref = Comment.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            Comment.prototype.nodeType = 8;
            Comment.prototype.toString = function() {
                return "<!--" + Comment.__super__.toString.call(this) + "-->";
            };
            return Comment;
        }(Text);
        Fragment = function(_super) {
            __extends(Fragment, _super);
            function Fragment() {
                _ref1 = Fragment.__super__.constructor.apply(this, arguments);
                return _ref1;
            }
            Fragment.prototype.nodeType = 11;
            Fragment.prototype.toString = function() {
                return this.childNodes.join("");
            };
            return Fragment;
        }(Container);
        StringNodeFactory = function(_super) {
            __extends(StringNodeFactory, _super);
            StringNodeFactory.prototype.name = "string";
            function StringNodeFactory(context) {
                this.context = context;
                this.internal = new bindable.Object;
            }
            StringNodeFactory.prototype.createElement = function(name) {
                return new Element(name);
            };
            StringNodeFactory.prototype.createTextNode = function(text) {
                return new Text(text);
            };
            StringNodeFactory.prototype.createComment = function(text) {
                return new Comment(text);
            };
            StringNodeFactory.prototype.createFragment = function(children) {
                var child, childrenToArray, frag, _i, _len;
                if (children == null) {
                    children = [];
                }
                frag = new Fragment;
                childrenToArray = Array.prototype.slice.call(children, 0);
                for (_i = 0, _len = childrenToArray.length; _i < _len; _i++) {
                    child = childrenToArray[_i];
                    frag.appendChild(child);
                }
                return frag;
            };
            StringNodeFactory.prototype.parseHtml = function(buffer) {
                return this.createTextNode(buffer);
            };
            return StringNodeFactory;
        }(require("nofactor/lib/base.js"));
        module.exports = new StringNodeFactory;
        return module.exports;
    });
    define("nofactor/lib/dom.js", function(require, module, exports, __dirname, __filename) {
        var DomFactory, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        DomFactory = function(_super) {
            __extends(DomFactory, _super);
            DomFactory.prototype.name = "dom";
            function DomFactory() {}
            DomFactory.prototype.createElement = function(name) {
                return document.createElement(name);
            };
            DomFactory.prototype.createTextNode = function(text) {
                return document.createTextNode(text);
            };
            DomFactory.prototype.createFragment = function(children) {
                var child, childrenToArray, frag, _i, _j, _len, _len1;
                if (children == null) {
                    children = [];
                }
                frag = document.createDocumentFragment();
                childrenToArray = [];
                for (_i = 0, _len = children.length; _i < _len; _i++) {
                    child = children[_i];
                    childrenToArray.push(child);
                }
                for (_j = 0, _len1 = childrenToArray.length; _j < _len1; _j++) {
                    child = childrenToArray[_j];
                    frag.appendChild(child);
                }
                return frag;
            };
            DomFactory.prototype.parseHtml = function(text) {
                var div;
                div = this.createElement("div");
                div.innerHTML = text;
                return this.createFragment.apply(this, div.childNodes);
            };
            return DomFactory;
        }(require("nofactor/lib/base.js"));
        module.exports = new DomFactory;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/block/base.js", function(require, module, exports, __dirname, __filename) {
        var BlockBinding, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BlockBinding = function(_super) {
            __extends(BlockBinding, _super);
            function BlockBinding(options) {
                this.section = options.section;
                this.clip = options.clip;
                this.nodeFactory = options.nodeFactory;
                this.contentTemplate = options.template;
                this.scriptName = options.scriptName;
                this.childBlockTemplate = options.childBlockTemplate;
                this.script = this.clip.script(this.scriptName);
                BlockBinding.__super__.constructor.call(this, this.clip, this.scriptName);
            }
            BlockBinding.prototype.bind = function(context) {
                this.context = context;
                this.clip.reset(this.context);
                return BlockBinding.__super__.bind.call(this, this.context);
            };
            BlockBinding.test = function(node) {
                return false;
            };
            return BlockBinding;
        }(require("paperclip/lib/paper/bindings/base/script.js"));
        module.exports = BlockBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/block/factory.js", function(require, module, exports, __dirname, __filename) {
        var BindingCollection, Factory, bindingClasses;
        BindingCollection = require("paperclip/lib/paper/bindings/collection.js");
        bindingClasses = {
            html: require("paperclip/lib/paper/bindings/block/html.js"),
            "if": require("paperclip/lib/paper/bindings/block/conditional.js"),
            "else": require("paperclip/lib/paper/bindings/block/conditional.js"),
            elseif: require("paperclip/lib/paper/bindings/block/conditional.js"),
            value: require("paperclip/lib/paper/bindings/block/value.js")
        };
        Factory = function() {
            function Factory() {}
            Factory.prototype.getBindings = function(options) {
                var bd, bindings, clipScriptNames, scriptName, _i, _len;
                bindings = [];
                clipScriptNames = options.clip.scripts.names;
                for (_i = 0, _len = clipScriptNames.length; _i < _len; _i++) {
                    scriptName = clipScriptNames[_i];
                    if (bd = bindingClasses[scriptName]) {
                        options.scriptName = scriptName;
                        bindings.push(new bd(options));
                    }
                }
                return bindings;
            };
            Factory.prototype.register = function(name, bindingClass) {
                return bindingClasses[name] = bindingClass;
            };
            return Factory;
        }();
        module.exports = new Factory;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/factory.js", function(require, module, exports, __dirname, __filename) {
        var NodeBindingFactory, allBindingClasses, bdble, classes, clazz, dataBind, defaultBindingClasses, nodeFactory, type, _i, _len;
        bdble = require("bindable/lib/index.js");
        allBindingClasses = {
            node: {},
            attr: {
                "default": []
            }
        };
        NodeBindingFactory = function() {
            function NodeBindingFactory() {}
            NodeBindingFactory.prototype.getBindings = function(options) {
                var attrName, attributes, bindable, bindables, bindingClass, bindingClasses, bindings, context, node, nodeName, _i, _j, _len, _len1;
                bindings = [];
                attributes = options.attributes;
                nodeName = options.nodeName;
                node = options.node;
                bindables = [ {
                    name: nodeName,
                    key: nodeName,
                    value: node,
                    type: "node",
                    node: node
                }, {
                    name: nodeName,
                    key: "default",
                    value: node,
                    type: "node",
                    node: node
                } ];
                context = void 0;
                for (attrName in attributes) {
                    bindables.push({
                        node: node,
                        name: attrName,
                        key: attrName,
                        value: attributes[attrName],
                        type: "attr"
                    });
                    bindables.push({
                        node: node,
                        name: attrName,
                        key: "default",
                        value: attributes[attrName],
                        type: "attr"
                    });
                }
                for (_i = 0, _len = bindables.length; _i < _len; _i++) {
                    bindable = bindables[_i];
                    bindingClasses = allBindingClasses[bindable.type][bindable.key] || [];
                    for (_j = 0, _len1 = bindingClasses.length; _j < _len1; _j++) {
                        bindingClass = bindingClasses[_j];
                        if (bindingClass.prototype.test(bindable)) {
                            if (!context) {
                                context = new bdble.Object;
                            }
                            bindable.context = context;
                            bindings.push(new bindingClass(bindable));
                        }
                    }
                }
                return bindings;
            };
            NodeBindingFactory.prototype.register = function(name, bindingClass) {
                var classes, type;
                type = bindingClass.type || bindingClass.prototype.type;
                if (!/node|attr/.test(String(type))) {
                    throw new Error('node binding class "' + bindingClass.name + "\" must have a type 'node', or 'attr'");
                }
                classes = allBindingClasses[type];
                if (!bindingClass.prototype.test) {
                    bindingClass.prototype.test = function() {
                        return true;
                    };
                }
                if (!classes[name]) {
                    classes[name] = [];
                }
                classes[name].push(bindingClass);
                return this;
            };
            return NodeBindingFactory;
        }();
        nodeFactory = module.exports = new NodeBindingFactory;
        defaultBindingClasses = {
            "default": [ require("paperclip/lib/paper/bindings/node/attrs/text/index.js") ],
            "data-bind": [ dataBind = module.exports.dataBind = require("paperclip/lib/paper/bindings/node/attrs/dataBind/index.js") ]
        };
        for (type in defaultBindingClasses) {
            classes = defaultBindingClasses[type];
            for (_i = 0, _len = classes.length; _i < _len; _i++) {
                clazz = classes[_i];
                nodeFactory.register(type, clazz);
            }
        }
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/base/index.js", function(require, module, exports, __dirname, __filename) {
        var BaseNodeBinding, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BaseNodeBinding = function(_super) {
            __extends(BaseNodeBinding, _super);
            function BaseNodeBinding(options) {
                this.name = options.name || this.name;
                this.node = options.node;
                this.value = options.value;
                this.nodeModel = options.context;
            }
            BaseNodeBinding.prototype.bind = function(context) {
                this.context = context;
            };
            BaseNodeBinding.prototype.unbind = function() {};
            return BaseNodeBinding;
        }(require("paperclip/lib/paper/bindings/base/index.js"));
        module.exports = BaseNodeBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js", function(require, module, exports, __dirname, __filename) {
        var BaseDataBindHandler, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BaseDataBindHandler = function(_super) {
            __extends(BaseDataBindHandler, _super);
            function BaseDataBindHandler(node, clip, name) {
                this.node = node;
                this.clip = clip;
                this.name = name;
                BaseDataBindHandler.__super__.constructor.call(this, this.clip, this.name);
            }
            return BaseDataBindHandler;
        }(require("paperclip/lib/paper/bindings/base/script.js"));
        module.exports = BaseDataBindHandler;
        return module.exports;
    });
    define("bindable/lib/object/setters/factory.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableSetter, CollectionSetter, FnSetter;
            FnSetter = require("bindable/lib/object/setters/fn.js");
            BindableSetter = require("bindable/lib/object/setters/bindable.js");
            CollectionSetter = require("bindable/lib/object/setters/collection.js");
            module.exports = function() {
                function _Class() {}
                _Class.prototype.createSetter = function(binding, target, property) {
                    var callback, to, toProperty;
                    to = null;
                    toProperty = null;
                    callback = null;
                    if (!target && !property) {
                        return null;
                    }
                    if (typeof property === "string") {
                        to = target;
                        toProperty = property;
                    } else if (typeof target === "string") {
                        to = binding._from;
                        toProperty = target;
                    } else if (typeof target === "function") {
                        callback = target;
                    } else if (typeof target === "object" && target) {
                        if (target.__isBinding) {
                            throw new Error("Cannot bind to a binding.");
                        } else if (target.__isCollection) {
                            return new CollectionSetter(binding, target);
                        }
                    }
                    if (callback) {
                        return new FnSetter(binding, callback);
                    } else if (to && toProperty) {
                        return new BindableSetter(binding, to, toProperty);
                    }
                    return null;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/core/utils.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var hoist;
            hoist = require("hoist/lib/index.js");
            exports.tryTransform = function(transformer, method, value) {
                if (!transformer) {
                    return value[0];
                }
                return transformer[method].call(transformer, value);
            };
            exports.transformer = function(options) {
                if (typeof options === "function") {
                    options = {
                        from: options,
                        to: options
                    };
                }
                if (!options.from) {
                    options.from = function(value) {
                        return value;
                    };
                }
                if (!options.to) {
                    options.to = function(value) {
                        return value;
                    };
                }
                return options;
            };
        }).call(this);
        return module.exports;
    });
    define("toarray/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = function(item) {
            if (item === undefined) return [];
            return Object.prototype.toString.call(item) === "[object Array]" ? item : [ item ];
        };
        return module.exports;
    });
    define("bindable/lib/object/deepPropertyWatcher.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var PropertyWatcher, options, type, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            type = require("type-component/index.js");
            options = require("bindable/lib/utils/options.js");
            PropertyWatcher = function() {
                function PropertyWatcher(options) {
                    this._changed = __bind(this._changed, this);
                    this.binding = options.biding;
                    this.target = options.target;
                    this.watch = options.watch;
                    this.path = options.path;
                    this.index = options.index;
                    this.root = options.root || this;
                    this.delay = options.delay;
                    this.callback = options.callback;
                    this.property = this.path[this.index];
                    this._children = [];
                    this._bindings = [];
                    this._value = void 0;
                    this._values = void 0;
                    this._watching = false;
                    this._updating = false;
                    this._disposed = false;
                    if (this._each = this.property.substr(0, 1) === "@") {
                        this.root._computeEach = true;
                        this.property = this.property.substr(1);
                    }
                    this._watch();
                }
                PropertyWatcher.prototype.value = function() {
                    var values;
                    values = [];
                    this._addValues(values);
                    if (this._computeEach) {
                        return values;
                    } else {
                        return values[0];
                    }
                };
                PropertyWatcher.prototype._addValues = function(values) {
                    var child, _i, _len, _ref;
                    if (!this._children.length) {
                        if (this._values) {
                            values.push.apply(values, this._values);
                        } else if (this._value != null) {
                            values.push(this._value);
                        }
                        return;
                    }
                    _ref = this._children;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        child._addValues(values);
                    }
                    return void 0;
                };
                PropertyWatcher.prototype.dispose = function() {
                    var binding, child, _i, _j, _len, _len1, _ref, _ref1, _ref2;
                    this._disposed = true;
                    if ((_ref = this._listener) != null) {
                        _ref.dispose();
                    }
                    this._listener = void 0;
                    _ref1 = this._bindings;
                    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                        binding = _ref1[_i];
                        binding.dispose();
                    }
                    _ref2 = this._children;
                    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                        child = _ref2[_j];
                        child.dispose();
                    }
                    this._children = [];
                    return this._bindings = [];
                };
                PropertyWatcher.prototype._update = function() {
                    var _this = this;
                    if (!~this.delay) {
                        this._watch();
                        this.callback();
                        return;
                    }
                    if (this._updating) {
                        return;
                    }
                    this._updating = true;
                    this._disposed = false;
                    return setTimeout(function() {
                        if (_this._disposed) {
                            return;
                        }
                        _this._watch();
                        return _this.callback();
                    }, this.delay);
                };
                PropertyWatcher.prototype._watch = function() {
                    var nt, prop, ref, t, value, _i, _len, _ref;
                    this._updating = false;
                    if (this.target) {
                        if (this.target.__isBindable) {
                            if ((nt = this.target.get()).__isBindable) {
                                this.target = nt;
                            }
                            this.watch = this.target;
                            this.childPath = this.path.slice(this.index);
                            this.childIndex = 1;
                            value = this.target.get(this.property);
                        } else {
                            value = this.target[this.property];
                            this.childPath = this.path;
                            this.childIndex = this.index + 1;
                        }
                    } else {
                        this.childPath = this.path;
                        this.childIndex = this.index + 1;
                    }
                    if (this._listener) {
                        this.dispose();
                    }
                    this._value = value;
                    if ((t = type(value)) === "function" && value.refs) {
                        _ref = value.refs;
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            ref = _ref[_i];
                            this._watchRef(ref);
                        }
                    }
                    prop = this.childPath.slice(0, this.childIndex - 1).concat(this.property).join(".");
                    this._listener = this.watch.on("change:" + prop, this._changed);
                    if (this._each) {
                        this._watchEachValue(value, t);
                    } else {
                        this._watchValue(value);
                    }
                    return this.watch._watching(prop);
                };
                PropertyWatcher.prototype._watchEachValue = function(fnOrArray, t) {
                    if (!~this.root.delay) {
                        this.root.delay = options.computedDelay;
                    }
                    switch (t) {
                      case "function":
                        return this._callEach(fnOrArray);
                      case "array":
                        return this._loopEach(fnOrArray);
                      case "undefined":
                        break;
                      default:
                        throw Error("'@" + this._property + "' is a " + t + ". '@" + this._property + "' must be either an array, or function.");
                    }
                };
                PropertyWatcher.prototype._callEach = function(fn) {
                    var _this = this;
                    this._values = [];
                    return fn.call(this.target, function(value) {
                        _this._values.push(value);
                        return _this._watchValue(value);
                    });
                };
                PropertyWatcher.prototype._loopEach = function(values) {
                    var value, _i, _len;
                    for (_i = 0, _len = values.length; _i < _len; _i++) {
                        value = values[_i];
                        this._watchValue(value);
                    }
                    return void 0;
                };
                PropertyWatcher.prototype._watchValue = function(value) {
                    if (this.childIndex < this.childPath.length) {
                        return this._children.push(new PropertyWatcher({
                            watch: this.watch,
                            target: value,
                            path: this.childPath,
                            index: this.childIndex,
                            callback: this.callback,
                            root: this.root,
                            delay: this.delay
                        }));
                    }
                };
                PropertyWatcher.prototype._watchRef = function(ref) {
                    return this._bindings.push(new PropertyWatcher({
                        target: this.target,
                        path: ref.split("."),
                        index: 0,
                        callback: this._changed,
                        delay: this.delay
                    }));
                };
                PropertyWatcher.prototype._changed = function(_value) {
                    this._value = _value;
                    return this.root._update();
                };
                return PropertyWatcher;
            }();
            module.exports = PropertyWatcher;
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/dref.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            exports.get = function(target, key, flatten) {
                var ct, i, k, keyParts, _i, _len;
                if (flatten == null) {
                    flatten = true;
                }
                if (!target) {
                    return target;
                }
                keyParts = key ? key.split(".") : [];
                ct = target;
                for (i = _i = 0, _len = keyParts.length; _i < _len; i = ++_i) {
                    k = keyParts[i];
                    if (!ct) {
                        return;
                    }
                    if (ct.__isBindable) {
                        return ct.get(keyParts.slice(i).join("."));
                    }
                    ct = ct[k];
                }
                if (flatten && ct && ct.__isBindable) {
                    return ct.get();
                }
                return ct;
            };
            exports.set = function(target, key, value) {
                var ct, i, k, keyParts, n, nv, _i, _len;
                if (!target || !key) {
                    return;
                }
                keyParts = key.split(".");
                ct = target.data;
                n = keyParts.length;
                for (i = _i = 0, _len = keyParts.length; _i < _len; i = ++_i) {
                    k = keyParts[i];
                    if (ct.__isBindable) {
                        return ct.set(keyParts.slice(i).join("."), value);
                    } else {
                        if (i === n - 1) {
                            if (ct[k] === value) {
                                return false;
                            }
                            ct[k] = value;
                            return true;
                        } else {
                            nv = ct[k];
                            if (!nv || typeof nv !== "object") {
                                nv = ct[k] = {};
                            }
                            ct = nv;
                        }
                    }
                }
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/binding.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var SettersFactory, settersFactory, utils;
            SettersFactory = require("bindable/lib/collection/setters/factory.js");
            settersFactory = new SettersFactory;
            utils = require("bindable/lib/core/utils.js");
            module.exports = function() {
                function _Class(_from) {
                    this._from = _from;
                    this._limit = -1;
                    this._setters = [];
                    this._listen();
                    this.map(function(value) {
                        return value;
                    });
                }
                _Class.prototype.transform = function() {
                    return this.map.apply(this, arguments);
                };
                _Class.prototype.map = function(value) {
                    if (!arguments.length) {
                        return this._transformer;
                    }
                    this._transformer = utils.transformer(value);
                    return this;
                };
                _Class.prototype.now = function() {
                    var item, setter, _i, _j, _len, _len1, _ref, _ref1;
                    _ref = this._setters;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        setter.now();
                    }
                    _ref1 = this._from.source();
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                        item = _ref1[_j];
                        this._callSetters("insert", item);
                    }
                    return this;
                };
                _Class.prototype.dispose = function() {
                    this._dispose(this._setters);
                    this._setters = void 0;
                    this._dispose(this._listeners);
                    return this._listeners = void 0;
                };
                _Class.prototype.copyId = function(value) {
                    if (!arguments.length) {
                        return this._copyId;
                    }
                    this._copyId = value;
                    return this;
                };
                _Class.prototype._dispose = function(collection) {
                    var disposable, _i, _len, _results;
                    if (collection) {
                        _results = [];
                        for (_i = 0, _len = collection.length; _i < _len; _i++) {
                            disposable = collection[_i];
                            _results.push(disposable.dispose());
                        }
                        return _results;
                    }
                };
                _Class.prototype.filter = function(search) {
                    if (!arguments.length) {
                        return this._filter;
                    }
                    this._filter = search;
                    return this;
                };
                _Class.prototype.to = function(collection, now) {
                    var setter;
                    if (now == null) {
                        now = true;
                    }
                    setter = settersFactory.createSetter(this, collection);
                    if (setter) {
                        this._setters.push(setter);
                        if (now === true) {
                            setter.now();
                        }
                    }
                    return this;
                };
                _Class.prototype._listen = function() {
                    var event, _i, _len, _ref, _results, _this = this;
                    this._listeners = [];
                    _ref = [ "insert", "remove", "reset" ];
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        event = _ref[_i];
                        _results.push(function(event) {
                            return _this._listeners.push(_this._from.on(event, function(item, index) {
                                return _this._callSetters(event, item, index);
                            }));
                        }(event));
                    }
                    return _results;
                };
                _Class.prototype._callSetters = function(method, item, index) {
                    var setter, _i, _len, _ref, _results;
                    _ref = this._setters;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        _results.push(setter.change(method, item, index));
                    }
                    return _results;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("hoist/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var method, transformer, _fn, _i, _len, _ref, _this = this;
            transformer = require("hoist/lib/transformer.js");
            module.exports = transformer;
            _ref = [ "cast", "map", "preCast", "preMap", "postCast", "postMap" ];
            _fn = function(method) {
                return module.exports[method] = function() {
                    var t;
                    t = transformer();
                    return t[method].apply(t, arguments);
                };
            };
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                method = _ref[_i];
                _fn(method);
            }
        }).call(this);
        return module.exports;
    });
    define("disposable/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var _disposable = {};
            _disposable.create = function() {
                var self = {}, disposables = [];
                self.add = function(disposable) {
                    if (arguments.length > 1) {
                        var collection = _disposable.create();
                        for (var i = arguments.length; i--; ) {
                            collection.add(arguments[i]);
                        }
                        return self.add(collection);
                    }
                    if (typeof disposable == "function") {
                        var disposableFunc = disposable, args = Array.prototype.slice.call(arguments, 0);
                        args.shift();
                        disposable = {
                            dispose: function() {
                                disposableFunc.apply(null, args);
                            }
                        };
                    } else if (!disposable || !disposable.dispose) {
                        return false;
                    }
                    disposables.push(disposable);
                    return {
                        dispose: function() {
                            var i = disposables.indexOf(disposable);
                            if (i > -1) disposables.splice(i, 1);
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
                    for (var i = disposables.length; i--; ) {
                        disposables[i].dispose();
                    }
                    disposables = [];
                };
                return self;
            };
            if (typeof module != "undefined") {
                module.exports = _disposable;
            } else if (typeof window != "undefined") {
                window.disposable = _disposable;
            }
        })();
        return module.exports;
    });
    define("paperclip/lib/paper/writers/fragment.js", function(require, module, exports, __dirname, __filename) {
        var FragmentWriter, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        FragmentWriter = function(_super) {
            __extends(FragmentWriter, _super);
            function FragmentWriter() {
                this.write = __bind(this.write, this);
                _ref = FragmentWriter.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            FragmentWriter.prototype.write = function(children) {
                return this.nodeFactory.createFragment(children);
            };
            return FragmentWriter;
        }(require("paperclip/lib/paper/writers/base.js"));
        module.exports = FragmentWriter;
        return module.exports;
    });
    define("paperclip/lib/paper/writers/block.js", function(require, module, exports, __dirname, __filename) {
        var BlockWriter, Clip, ClipBinding, blockBindingFactory, loaf, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        loaf = require("loaf/lib/index.js");
        blockBindingFactory = require("paperclip/lib/paper/bindings/block/factory.js");
        Clip = require("paperclip/lib/clip/index.js");
        ClipBinding = require("paperclip/lib/paper/bindings/clip.js");
        BlockWriter = function(_super) {
            __extends(BlockWriter, _super);
            function BlockWriter() {
                this.write = __bind(this.write, this);
                _ref = BlockWriter.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            BlockWriter.prototype.write = function(script, contentFactory, childBlockFactory) {
                var childTpl, clip, section, tpl, _ref1;
                tpl = contentFactory ? this.template.creator(contentFactory) : void 0;
                childTpl = childBlockFactory ? this.template.creator(childBlockFactory) : void 0;
                section = loaf(this.nodeFactory);
                clip = new Clip({
                    script: script,
                    watch: false
                });
                (_ref1 = this.bindings).push.apply(_ref1, blockBindingFactory.getBindings({
                    section: section,
                    clip: clip,
                    template: tpl,
                    nodeFactory: this.nodeFactory,
                    childBlockTemplate: childTpl
                }));
                return section.toFragment();
            };
            return BlockWriter;
        }(require("paperclip/lib/paper/writers/base.js"));
        module.exports = BlockWriter;
        return module.exports;
    });
    define("paperclip/lib/paper/writers/text.js", function(require, module, exports, __dirname, __filename) {
        var TextWriter, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        TextWriter = function(_super) {
            __extends(TextWriter, _super);
            function TextWriter() {
                this.write = __bind(this.write, this);
                _ref = TextWriter.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            TextWriter.prototype.write = function(text) {
                var node;
                node = this.nodeFactory.createElement("div");
                node.innerHTML = text;
                return node.childNodes[0] || this.nodeFactory.createTextNode(text);
            };
            return TextWriter;
        }(require("paperclip/lib/paper/writers/base.js"));
        module.exports = TextWriter;
        return module.exports;
    });
    define("paperclip/lib/paper/writers/element.js", function(require, module, exports, __dirname, __filename) {
        var ElementWriter, nodeBindingFactory, type, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        nodeBindingFactory = require("paperclip/lib/paper/bindings/node/factory.js");
        type = require("type-component/index.js");
        ElementWriter = function(_super) {
            __extends(ElementWriter, _super);
            function ElementWriter() {
                this.write = __bind(this.write, this);
                _ref = ElementWriter.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ElementWriter.prototype.write = function(name, attributes, children) {
                var attrName, child, element, v, _i, _len, _ref1;
                if (attributes == null) {
                    attributes = {};
                }
                if (children == null) {
                    children = [];
                }
                element = this.nodeFactory.createElement(name);
                for (attrName in attributes) {
                    v = attributes[attrName];
                    if (v.length === 1 && type(v[0]) === "string") {
                        element.setAttribute(attrName, v[0]);
                    }
                }
                (_ref1 = this.bindings).push.apply(_ref1, nodeBindingFactory.getBindings({
                    node: element,
                    nodeName: name,
                    attributes: attributes
                }));
                for (_i = 0, _len = children.length; _i < _len; _i++) {
                    child = children[_i];
                    element.appendChild(child);
                }
                return element;
            };
            return ElementWriter;
        }(require("paperclip/lib/paper/writers/base.js"));
        module.exports = ElementWriter;
        return module.exports;
    });
    define("paperclip/lib/paper/writers/parse.js", function(require, module, exports, __dirname, __filename) {
        var ParseWriter, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        ParseWriter = function(_super) {
            __extends(ParseWriter, _super);
            function ParseWriter() {
                this.write = __bind(this.write, this);
                _ref = ParseWriter.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ParseWriter.prototype.write = function(source) {
                var element;
                if (typeof window !== "undefined") {
                    element = this.nodeFactory.createElement("div");
                    element.innerHTML = source;
                } else {
                    element = this.nodeFactory.createTextNode(source);
                }
                return element;
            };
            return ParseWriter;
        }(require("paperclip/lib/paper/writers/base.js"));
        module.exports = ParseWriter;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/collection.js", function(require, module, exports, __dirname, __filename) {
        var BaseBinding, Collection, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BaseBinding = require("paperclip/lib/paper/bindings/base/index.js");
        Collection = function(_super) {
            __extends(Collection, _super);
            function Collection(node, _source) {
                this.node = node;
                this._source = _source != null ? _source : [];
            }
            Collection.prototype.push = function() {
                var _ref;
                return (_ref = this._source).push.apply(_ref, arguments);
            };
            Collection.prototype.bind = function(context) {
                var binding, _i, _len, _ref;
                this.context = context;
                if (this._bound) {
                    return;
                }
                this._bound = true;
                _ref = this._source;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    binding = _ref[_i];
                    binding.bind(this.context);
                }
            };
            Collection.prototype.unbind = function() {
                var binding, _i, _len, _ref;
                if (!this._bound) {
                    return;
                }
                this._bound = false;
                _ref = this._source;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    binding = _ref[_i];
                    binding.unbind();
                }
            };
            return Collection;
        }(BaseBinding);
        module.exports = Collection;
        return module.exports;
    });
    define("loaf/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var Section, loaf, nofactor, __slice = [].slice;
        nofactor = require("nofactor/lib/index.js");
        Section = function() {
            Section.prototype.__isLoafSection = true;
            function Section(nodeFactory) {
                var parent;
                this.nodeFactory = nodeFactory != null ? nodeFactory : nofactor["default"];
                this.start = this.nodeFactory.createTextNode("");
                this.end = this.nodeFactory.createTextNode("");
                parent = this.nodeFactory.createElement("div");
                parent.appendChild(this.start);
                parent.appendChild(this.end);
            }
            Section.prototype.replace = function(node) {
                node.parentNode.insertBefore(this.toFragment(), node);
                return node.parentNode.removeChild(node);
            };
            Section.prototype.show = function() {
                if (!this._detached) {
                    return this;
                }
                this.append.apply(this, this._detached.getInnerChildNodes());
                this._detached = void 0;
                return this;
            };
            Section.prototype.hide = function() {
                this._detached = this.removeAll();
                return this;
            };
            Section.prototype.removeAll = function() {
                return this._loaf(this._removeAll());
            };
            Section.prototype._removeAll = function() {
                var children, current, start;
                start = this.start;
                current = start.nextSibling;
                children = [];
                while (current !== this.end) {
                    current.parentNode.removeChild(current);
                    children.push(current);
                    current = this.start.nextSibling;
                }
                return children;
            };
            Section.prototype.append = function() {
                var children;
                children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                return this._insertAfter(children, this.end.previousSibling);
            };
            Section.prototype.prepend = function() {
                var children;
                children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                return this._insertAfter(children, this.start);
            };
            Section.prototype.replaceChildNodes = function() {
                this.removeAll();
                return this.append.apply(this, arguments);
            };
            Section.prototype.toString = function() {
                var buffer;
                buffer = this.getChildNodes().map(function(node) {
                    var _ref;
                    return node.innerHTML || ((_ref = node.nodeValue) != null ? _ref : String(node));
                });
                return buffer.join("");
            };
            Section.prototype.toFragment = function() {
                return this.nodeFactory.createFragment(this.getChildNodes());
            };
            Section.prototype.dispose = function() {
                if (this._disposed) {
                    return;
                }
                this._disposed = true;
                this._removeAll();
                this.start.parentNode.removeChild(this.start);
                return this.end.parentNode.removeChild(this.end);
            };
            Section.prototype.getChildNodes = function() {
                var children, cn, end;
                cn = this.start;
                end = this.end.nextSibling;
                children = [];
                while (cn !== end) {
                    children.push(cn);
                    cn = cn.nextSibling;
                }
                return children;
            };
            Section.prototype.getInnerChildNodes = function() {
                var cn;
                cn = this.getChildNodes();
                cn.shift();
                cn.pop();
                return cn;
            };
            Section.prototype._insertAfter = function(newNodes, refNode) {
                if (!newNodes.length) {
                    return;
                }
                newNodes = newNodes.map(function(node) {
                    if (node.__isLoafSection) {
                        return node.toFragment();
                    } else {
                        return node;
                    }
                });
                if (newNodes.length > 1) {
                    newNodes = this.nodeFactory.createFragment(newNodes);
                } else {
                    newNodes = newNodes[0];
                }
                return refNode.parentNode.insertBefore(newNodes, refNode.nextSibling);
            };
            Section.prototype._loaf = function(children) {
                var l;
                l = new loaf;
                l.append.apply(l, children);
                return l;
            };
            return Section;
        }();
        module.exports = loaf = function(nodeFactory) {
            return new Section(nodeFactory);
        };
        return module.exports;
    });
    define("nofactor/lib/ent.js", function(require, module, exports, __dirname, __filename) {
        var entities;
        entities = {
            "<": "lt",
            "&": "amp",
            ">": "gt",
            '"': "quote"
        };
        module.exports = function(str) {
            str = String(str);
            return str.split("").map(function(c) {
                var cc, e;
                e = entities[c];
                cc = c.charCodeAt(0);
                if (e) {
                    return "&" + e + ";";
                } else if (c.match(/\s/)) {
                    return c;
                } else if (cc < 32 || cc > 126) {
                    return "&#" + cc + ";";
                }
                return c;
            }).join("");
        };
        return module.exports;
    });
    define("nofactor/lib/base.js", function(require, module, exports, __dirname, __filename) {
        var BaseFactory;
        BaseFactory = function() {
            function BaseFactory() {}
            BaseFactory.prototype.createElement = function(element) {};
            BaseFactory.prototype.createFragment = function() {};
            BaseFactory.prototype.createComment = function(text) {};
            BaseFactory.prototype.createTextNode = function(text) {};
            BaseFactory.prototype.parseHtml = function(content) {};
            return BaseFactory;
        }();
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/base/script.js", function(require, module, exports, __dirname, __filename) {
        var ScriptBinding, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        ScriptBinding = function(_super) {
            __extends(ScriptBinding, _super);
            function ScriptBinding(clip, scriptName) {
                this.clip = clip;
                this.scriptName = scriptName;
                this._onChange = __bind(this._onChange, this);
                this.script = clip.script(this.scriptName);
            }
            ScriptBinding.prototype.bind = function(context) {
                this.context = context;
                if (this.watch !== false) {
                    this.script.watch().update();
                }
                this._binding = this.clip.bind(this.scriptName);
                if (this._map) {
                    this._binding.map(this._map);
                }
                this._binding.to(this._onChange);
                this._binding.now();
                return this;
            };
            ScriptBinding.prototype.unbind = function() {
                var _ref;
                if ((_ref = this._binding) != null) {
                    _ref.dispose();
                }
                this._binding = void 0;
                return this;
            };
            ScriptBinding.prototype._onChange = function(value) {};
            return ScriptBinding;
        }(require("paperclip/lib/paper/bindings/base/index.js"));
        module.exports = ScriptBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/block/html.js", function(require, module, exports, __dirname, __filename) {
        var HtmlDecor, type, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        type = require("type-component/index.js");
        HtmlDecor = function(_super) {
            __extends(HtmlDecor, _super);
            function HtmlDecor() {
                _ref = HtmlDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            HtmlDecor.prototype._onChange = function(value, oldValue) {
                var dom, node;
                if (oldValue != null ? oldValue.section : void 0) {
                    oldValue.section.hide();
                }
                this.section.removeAll();
                if (!value) {
                    return this.section.removeAll();
                }
                if (value.createFragment) {
                    node = value.createFragment();
                } else if (value.section) {
                    node = value.section.show().toFragment();
                } else if (value.nodeType != null) {
                    node = value;
                } else {
                    if (this.nodeFactory.name === "string") {
                        node = this.nodeFactory.createTextNode(String(value));
                    } else {
                        dom = this.nodeFactory.createElement("div");
                        dom.innerHTML = String(value);
                        node = this.nodeFactory.createFragment(dom.childNodes);
                    }
                }
                return this.section.replaceChildNodes(node);
            };
            return HtmlDecor;
        }(require("paperclip/lib/paper/bindings/block/base.js"));
        module.exports = HtmlDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/block/conditional.js", function(require, module, exports, __dirname, __filename) {
        var BlockDecor, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BlockDecor = function(_super) {
            __extends(BlockDecor, _super);
            function BlockDecor() {
                this._onChange = __bind(this._onChange, this);
                _ref = BlockDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            BlockDecor.prototype._map = function(value) {
                return !!value;
            };
            BlockDecor.prototype._onChange = function(value) {
                var childTemplate, oldChild, _ref1;
                oldChild = this.child;
                if ((_ref1 = this.child) != null) {
                    _ref1.unbind();
                }
                this.child = void 0;
                if (value) {
                    childTemplate = this.contentTemplate;
                } else {
                    childTemplate = this.childBlockTemplate;
                }
                if (childTemplate) {
                    this.child = childTemplate.bind(this.context);
                    return this.section.replaceChildNodes(this.child.section.toFragment());
                } else if (oldChild != null) {
                    return oldChild.section.hide();
                }
            };
            return BlockDecor;
        }(require("paperclip/lib/paper/bindings/block/base.js"));
        module.exports = BlockDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/block/value.js", function(require, module, exports, __dirname, __filename) {
        var ValueDecor, escapeHTML, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        escapeHTML = require("paperclip/lib/paper/utils/escapeHTML.js");
        ValueDecor = function(_super) {
            __extends(ValueDecor, _super);
            function ValueDecor() {
                _ref = ValueDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ValueDecor.prototype._onChange = function(value) {
                if (value == null) {
                    value = "";
                }
                return this.section.replaceChildNodes(this.nodeFactory.createTextNode(String(value)));
            };
            return ValueDecor;
        }(require("paperclip/lib/paper/bindings/block/base.js"));
        module.exports = ValueDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/text/index.js", function(require, module, exports, __dirname, __filename) {
        var AttrTextBinding, ClippedBuffer, type, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        type = require("type-component/index.js");
        ClippedBuffer = require("paperclip/lib/clip/buffer.js");
        AttrTextBinding = function(_super) {
            __extends(AttrTextBinding, _super);
            AttrTextBinding.prototype.type = "attr";
            function AttrTextBinding(options) {
                this._onChange = __bind(this._onChange, this);
                AttrTextBinding.__super__.constructor.call(this, options);
                this.clippedBuffer = new ClippedBuffer(this.value);
            }
            AttrTextBinding.prototype.bind = function(context) {
                this.context = context;
                return this._binding = this.clippedBuffer.reset(this.context).bind("text").to(this._onChange).now();
            };
            AttrTextBinding.prototype.unbind = function() {
                var _ref;
                if ((_ref = this._binding) != null) {
                    _ref.dispose();
                }
                return this._binding;
            };
            AttrTextBinding.prototype._onChange = function(text) {
                if (!text.length) {
                    this.node.removeAttribute(this.name);
                    return;
                }
                this.node.setAttribute(this.name, text);
                return this.nodeModel.set(this.name, text);
            };
            AttrTextBinding.prototype.test = function(binding) {
                var v, _i, _len, _ref;
                if (type(binding.value) !== "array") {
                    return false;
                }
                _ref = binding.value;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    v = _ref[_i];
                    if (v.fn) {
                        return true;
                    }
                }
                return false;
            };
            return AttrTextBinding;
        }(require("paperclip/lib/paper/bindings/node/base/index.js"));
        module.exports = AttrTextBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/index.js", function(require, module, exports, __dirname, __filename) {
        var AttrDataBinding, BindingCollection, Clip, dataBindingClasses, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        Clip = require("paperclip/lib/clip/index.js");
        BindingCollection = require("paperclip/lib/paper/bindings/collection.js");
        dataBindingClasses = {
            show: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/show.js"),
            css: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/css.js"),
            style: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/style.js"),
            disable: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/disable.js"),
            value: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/value.js"),
            model: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/model.js"),
            click: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            submit: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            mousedown: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            mouseup: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            mouseover: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            mouseout: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            keydown: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            keyup: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            enter: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/enter.js"),
            "delete": require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/delete.js"),
            onClick: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onLoad: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onSubmit: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onMouseDown: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onMouseUp: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onMouseOver: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onMouseOut: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onKeyDown: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onKeyUp: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"),
            onEnter: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/enter.js"),
            onChange: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/change.js"),
            onDelete: require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/delete.js")
        };
        AttrDataBinding = function(_super) {
            __extends(AttrDataBinding, _super);
            AttrDataBinding.prototype.type = "attr";
            function AttrDataBinding(options) {
                var bc, scriptName, _i, _len, _ref;
                AttrDataBinding.__super__.constructor.call(this, options);
                this.clip = new Clip({
                    scripts: options.value[0],
                    watch: false,
                    context: options.context
                });
                this._bindings = new BindingCollection;
                _ref = this.clip.scripts.names;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    scriptName = _ref[_i];
                    if (!(bc = dataBindingClasses[scriptName])) {
                        continue;
                    }
                    this._bindings.push(new bc(this.node, this.clip, scriptName));
                }
            }
            AttrDataBinding.prototype.bind = function(context) {
                this.context = context;
                this.clip.reset(this.context, false);
                return this._bindings.bind(this.context);
            };
            AttrDataBinding.prototype.unbind = function() {
                return this._bindings.unbind();
            };
            return AttrDataBinding;
        }(require("paperclip/lib/paper/bindings/node/base/index.js"));
        module.exports = AttrDataBinding;
        module.exports.register = function(name, dataBindClass) {
            return dataBindingClasses[name] = dataBindClass;
        };
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/base/index.js", function(require, module, exports, __dirname, __filename) {
        var BaseBinding;
        BaseBinding = function() {
            function BaseBinding(node) {
                this.node = node;
            }
            BaseBinding.prototype.bind = function(context) {
                this.context = context;
            };
            BaseBinding.prototype.unbind = function() {};
            return BaseBinding;
        }();
        module.exports = BaseBinding;
        return module.exports;
    });
    define("bindable/lib/object/setters/fn.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Base = require("bindable/lib/object/setters/base.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class(binding, callback) {
                    this.binding = binding;
                    this.callback = callback;
                    _Class.__super__.constructor.call(this, this.binding);
                }
                _Class.prototype._change = function(newValue, oldValue) {
                    return this.callback(newValue, oldValue);
                };
                _Class.prototype.dispose = function() {
                    return this.callback = null;
                };
                return _Class;
            }(Base);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/setters/bindable.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Base, type, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Base = require("bindable/lib/object/setters/base.js");
            type = require("type-component/index.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class(binding, to, property) {
                    this.binding = binding;
                    this.to = to;
                    this.property = property;
                    _Class.__super__.constructor.call(this, this.binding);
                }
                _Class.prototype._change = function(newValue) {
                    this._ignoreBothWays = true;
                    this.to.set(this.property, newValue);
                    return this._ignoreBothWays = false;
                };
                _Class.prototype.dispose = function() {
                    var _ref;
                    if ((_ref = this._bothWaysBinding) != null) {
                        _ref.dispose();
                    }
                    return this._bothWaysBinding = this.binding = this.to = this.properties = null;
                };
                _Class.prototype.bothWays = function() {
                    var _this = this;
                    return this._bothWaysBinding = this.to.bind(this.property).map({
                        to: function() {
                            var value, _ref;
                            value = (_ref = _this.binding._map).from.apply(_ref, arguments);
                            if (type(value) === "array") {
                                return value;
                            } else {
                                return [ value ];
                            }
                        }
                    }).to(function(values) {
                        var i, prop, value, _i, _len;
                        if (_this._ignoreBothWays) {
                            return;
                        }
                        for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
                            value = values[i];
                            prop = _this.binding._properties[i];
                            _this.binding._from.set(prop, value);
                        }
                    });
                };
                return _Class;
            }(Base);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/setters/collection.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Base = require("bindable/lib/object/setters/base.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class(binding, to, property) {
                    this.binding = binding;
                    this.to = to;
                    this.property = property;
                    _Class.__super__.constructor.call(this, this.binding);
                }
                _Class.prototype._change = function(newValue, oldValue) {
                    return this.to.reset(newValue, oldValue);
                };
                _Class.prototype.dispose = function() {
                    return this.to.disposeSourceBinding();
                };
                return _Class;
            }(Base);
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/factory.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var CollectionSetter, FnSetter, ObjSetter;
            FnSetter = require("bindable/lib/collection/setters/fn.js");
            ObjSetter = require("bindable/lib/collection/setters/object.js");
            CollectionSetter = require("bindable/lib/collection/setters/collection.js");
            module.exports = function() {
                function _Class() {}
                _Class.prototype.createSetter = function(binding, target) {
                    if (!target) {
                        return null;
                    }
                    if (typeof target === "function") {
                        return new FnSetter(binding, target);
                    } else if (target.__isCollection) {
                        return new CollectionSetter(binding, target);
                    } else if (target.insert || target.update || target.remove || target.replace) {
                        return new ObjSetter(binding, target);
                    }
                    return null;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("hoist/lib/transformer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var async, getArrayTypeCaster, getClassTypeCaster, getSimpleDataTypeCaster, getTypeCaster, type;
            type = require("type-component/index.js");
            async = require("async/lib/async.js");
            getArrayTypeCaster = function() {
                return function(value) {
                    if (type(value) === "array") {
                        return value;
                    }
                    return [ value ];
                };
            };
            getSimpleDataTypeCaster = function(typeClass) {
                return function(value) {
                    return typeClass(value);
                };
            };
            getClassTypeCaster = function(typeClass) {
                return function(value) {
                    if (value && value.constructor === typeClass) {
                        return value;
                    }
                    return new typeClass(value);
                };
            };
            getTypeCaster = function(typeClass) {
                if (typeClass === Array) {
                    return getArrayTypeCaster();
                }
                if (typeClass === String || typeClass === Number) {
                    return getSimpleDataTypeCaster(typeClass);
                }
                return getClassTypeCaster(typeClass);
            };
            module.exports = function(options) {
                var caster, mapper, self, _mid, _post, _pre, _transform;
                if (options == null) {
                    options = {};
                }
                _transform = [];
                _pre = [];
                _post = [];
                _mid = [];
                self = function(value, next) {
                    if (arguments.length > 1 && type(arguments[arguments.length - 1]) === "function") {
                        return self.async(value, next);
                    } else {
                        return self.sync.apply(null, arguments);
                    }
                };
                self.async = function(value, next) {
                    return async.eachSeries(_transform, function(transformer, next) {
                        if (transformer.async) {
                            return transformer.transform(value, function(err, result) {
                                if (err) {
                                    return next(err);
                                }
                                return next(null, value = result);
                            });
                        } else {
                            value = transformer.transform(value);
                            return next();
                        }
                    }, function(err, result) {
                        if (err) {
                            return next(err);
                        }
                        return next(null, value);
                    });
                };
                self.sync = function() {
                    var transformer, _i, _len;
                    for (_i = 0, _len = _transform.length; _i < _len; _i++) {
                        transformer = _transform[_i];
                        arguments[0] = transformer.transform.apply(null, arguments);
                    }
                    return arguments[0];
                };
                self.preCast = function(typeClass) {
                    return self._push(caster(typeClass), _pre);
                };
                self.cast = function(typeClass) {
                    return self._push(caster(typeClass), _mid);
                };
                self.postCast = function(typeClass) {
                    return self._push(caster(typeClass), _post);
                };
                caster = function(typeClass) {
                    return {
                        transform: getTypeCaster(typeClass)
                    };
                };
                self.preMap = function(fn) {
                    return self._push(mapper(fn), _pre);
                };
                self.map = function(fn) {
                    return self._push(mapper(fn), _mid);
                };
                self.postMap = function(fn) {
                    return self._push(mapper(fn), _post);
                };
                mapper = function(fn) {
                    return {
                        async: fn.length > 1,
                        transform: fn
                    };
                };
                self._push = function(obj, stack) {
                    stack.push(obj);
                    _transform = _pre.concat(_mid).concat(_post);
                    return this;
                };
                return self;
            };
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/writers/base.js", function(require, module, exports, __dirname, __filename) {
        var BaseWriter;
        BaseWriter = function() {
            function BaseWriter(loader) {
                this.loader = loader;
                this.nodeFactory = loader.nodeFactory;
                this.bindings = loader.bindings;
                this.template = loader.template;
            }
            return BaseWriter;
        }();
        module.exports = BaseWriter;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/clip.js", function(require, module, exports, __dirname, __filename) {
        var ClipBinding, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        ClipBinding = function(_super) {
            __extends(ClipBinding, _super);
            function ClipBinding(clip) {
                this.clip = clip;
            }
            ClipBinding.prototype.bind = function(context) {
                this.context = context;
                this.clip.reset(this.context);
                return this.clip.watch();
            };
            ClipBinding.prototype.unbind = function() {
                return this.clip.unwatch();
            };
            return ClipBinding;
        }(require("paperclip/lib/paper/bindings/base/index.js"));
        module.exports = ClipBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/utils/escapeHTML.js", function(require, module, exports, __dirname, __filename) {
        var entities;
        entities = {
            "<": "lt",
            "&": "amp",
            ">": "gt",
            '"': "quote"
        };
        module.exports = function(str) {
            str = String(str);
            return str.split("").map(function(c) {
                var cc, e;
                e = entities[c];
                cc = c.charCodeAt(0);
                if (e) {
                    return "&" + e + ";";
                } else if (c.match(/\s/)) {
                    return c;
                } else if (cc < 32 || cc > 126) {
                    return "&#" + cc + ";";
                }
                return c;
            }).join("");
        };
        return module.exports;
    });
    define("paperclip/lib/clip/buffer.js", function(require, module, exports, __dirname, __filename) {
        var Clip, ClippedBuffer, ClippedBufferPart, bindable, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        bindable = require("bindable/lib/index.js");
        Clip = require("paperclip/lib/clip/index.js");
        ClippedBufferPart = function() {
            function ClippedBufferPart(clippedBuffer, script) {
                this.clippedBuffer = clippedBuffer;
                this.script = script;
                this._onUpdated = __bind(this._onUpdated, this);
                this.clip = new Clip({
                    script: this.script
                });
                this.clip.bind("value").to(this._onUpdated);
            }
            ClippedBufferPart.prototype.dispose = function() {
                return this.clip.dispose();
            };
            ClippedBufferPart.prototype.update = function() {
                this.clip.reset(this.clippedBuffer._data);
                this.clip.update();
                return this.value = this.clip.get("value");
            };
            ClippedBufferPart.prototype._onUpdated = function(value) {
                this.value = value;
                if (this.clippedBuffer._updating) {
                    return;
                }
                return this.clippedBuffer.update();
            };
            ClippedBufferPart.prototype.toString = function() {
                var _ref;
                return String((_ref = this.value) != null ? _ref : "");
            };
            return ClippedBufferPart;
        }();
        ClippedBuffer = function(_super) {
            __extends(ClippedBuffer, _super);
            function ClippedBuffer(buffer) {
                var binding, bufferPart, _i, _len;
                ClippedBuffer.__super__.constructor.call(this);
                this.buffer = [];
                this.bindings = [];
                this._data = {};
                for (_i = 0, _len = buffer.length; _i < _len; _i++) {
                    bufferPart = buffer[_i];
                    if (bufferPart.fn) {
                        this.buffer.push(binding = new ClippedBufferPart(this, bufferPart));
                        this.bindings.push(binding);
                    } else {
                        this.buffer.push(bufferPart);
                    }
                }
            }
            ClippedBuffer.prototype.reset = function(data) {
                if (data == null) {
                    data = {};
                }
                this._data = data;
                this.update();
                return this;
            };
            ClippedBuffer.prototype.dispose = function() {
                var binding, _i, _len, _ref;
                _ref = this.bindings;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    binding = _ref[_i];
                    binding.dispose();
                }
                return this.bindings = [];
            };
            ClippedBuffer.prototype.update = function() {
                var binding, _i, _len, _ref;
                this._updating = true;
                _ref = this.bindings;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    binding = _ref[_i];
                    binding.update();
                }
                this.set("text", this.text = this.render());
                return this._updating = false;
            };
            ClippedBuffer.prototype.render = function() {
                return this.buffer.join("");
            };
            ClippedBuffer.prototype.toString = function() {
                return this.text;
            };
            return ClippedBuffer;
        }(bindable.Object);
        module.exports = ClippedBuffer;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/show.js", function(require, module, exports, __dirname, __filename) {
        var ShowAttrBinding, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        ShowAttrBinding = function(_super) {
            __extends(ShowAttrBinding, _super);
            function ShowAttrBinding() {
                _ref = ShowAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ShowAttrBinding.prototype.bind = function(context) {
                this._displayStyle = this.node.style.display;
                return ShowAttrBinding.__super__.bind.call(this, context);
            };
            ShowAttrBinding.prototype._map = function(value) {
                return !!value;
            };
            ShowAttrBinding.prototype._onChange = function(value) {
                return this.node.style.display = value ? this._displayStyle : "none";
            };
            return ShowAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js"));
        module.exports = ShowAttrBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/css.js", function(require, module, exports, __dirname, __filename) {
        var CssAttrBinding, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        CssAttrBinding = function(_super) {
            __extends(CssAttrBinding, _super);
            function CssAttrBinding() {
                this._onChange = __bind(this._onChange, this);
                _ref = CssAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            CssAttrBinding.prototype._onChange = function(classes) {
                var className, classesToUse, i, useClass, _ref1;
                classesToUse = ((_ref1 = this.node.getAttribute("class")) != null ? _ref1.split(" ") : void 0) || [];
                for (className in classes) {
                    useClass = classes[className];
                    i = classesToUse.indexOf(className);
                    if (useClass) {
                        if (!~i) {
                            classesToUse.push(className);
                        }
                    } else if (~i) {
                        classesToUse.splice(i, 1);
                    }
                }
                return this.node.setAttribute("class", classesToUse.join(" "));
            };
            return CssAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js"));
        module.exports = CssAttrBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/style.js", function(require, module, exports, __dirname, __filename) {
        var StyleDecor, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        StyleDecor = function(_super) {
            __extends(StyleDecor, _super);
            function StyleDecor() {
                _ref = StyleDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            StyleDecor.prototype.bind = function() {
                this._currentStyles = {};
                return StyleDecor.__super__.bind.apply(this, arguments);
            };
            StyleDecor.prototype._onChange = function(styles) {
                var key, name, newStyles, rmStyle, style;
                newStyles = {};
                rmStyle = {};
                for (name in styles) {
                    style = styles[name];
                    if (style !== this._currentStyles[name]) {
                        newStyles[name] = this._currentStyles[name] = style || "";
                    }
                }
                if (typeof window === "undefined") {
                    for (key in newStyles) {
                        this.node.style[key] = newStyles[key];
                    }
                } else {
                    $(this.node).css(newStyles);
                }
            };
            return StyleDecor;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js"));
        module.exports = StyleDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/disable.js", function(require, module, exports, __dirname, __filename) {
        var DisableAttrBinding, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        DisableAttrBinding = function(_super) {
            __extends(DisableAttrBinding, _super);
            function DisableAttrBinding() {
                _ref = DisableAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            DisableAttrBinding.prototype._onChange = function(value) {
                if (value) {
                    return this.node.setAttribute("disabled", "disabled");
                } else {
                    return this.node.removeAttribute("disabled");
                }
            };
            return DisableAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js"));
        module.exports = DisableAttrBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/value.js", function(require, module, exports, __dirname, __filename) {
        var ChangeDecor, ValueAttrBinding, type, _, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        _ = require("underscore/underscore.js");
        ChangeDecor = require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/change.js");
        type = require("type-component/index.js");
        ValueAttrBinding = function(_super) {
            __extends(ValueAttrBinding, _super);
            function ValueAttrBinding() {
                this._elementValue = __bind(this._elementValue, this);
                this._onChange = __bind(this._onChange, this);
                this._onElementChange = __bind(this._onElementChange, this);
                _ref = ValueAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ValueAttrBinding.prototype.bind = function() {
                ValueAttrBinding.__super__.bind.call(this);
                (this.$element = $(this.node)).bind(ChangeDecor.events, this._onElementChange);
                return this._onChange(this.clip.get("value"));
            };
            ValueAttrBinding.prototype._onElementChange = function(event) {
                var _this = this;
                event.stopPropagation();
                clearTimeout(this._changeTimeout);
                return this._changeTimeout = setTimeout(function() {
                    var ref, value, _i, _len, _ref1;
                    value = _this._elementValue();
                    if (_this.clip.get("bothWays")) {
                        _this._currentValue = value;
                        _ref1 = _this.refs;
                        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                            ref = _ref1[_i];
                            _this.context.set(ref, value);
                        }
                    }
                }, 5);
            };
            ValueAttrBinding.prototype.dispose = function() {
                var _ref1;
                return (_ref1 = this.$element) != null ? _ref1.unbind(ChangeDecor.events, this._onElementChange) : void 0;
            };
            ValueAttrBinding.prototype._onChange = function(value) {
                return this._elementValue(value);
            };
            ValueAttrBinding.prototype._elementValue = function(value) {
                var isInput;
                if (value == null) {
                    value = "";
                }
                isInput = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());
                if (!arguments.length) {
                    if (isInput) {
                        return this._checkedOrValue();
                    } else {
                        return this.node.innerHTML;
                    }
                }
                this.currentValue = value;
                if (isInput) {
                    return this._checkedOrValue(value);
                } else {
                    return this.node.innerHTML = value;
                }
            };
            ValueAttrBinding.prototype._checkedOrValue = function(value) {
                var isCheckbox;
                isCheckbox = /checkbox/.test(this.node.type);
                if (!arguments.length) {
                    if (isCheckbox) {
                        return this.node.checked;
                    } else {
                        return this.node.value;
                    }
                }
                if (isCheckbox) {
                    return this.node.checked = value;
                } else {
                    return this.node.value = value;
                }
            };
            return ValueAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js"));
        module.exports = ValueAttrBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/model.js", function(require, module, exports, __dirname, __filename) {
        var ChangeDecor, ModelAttrBinding, dref, type, _, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        _ = require("underscore/underscore.js");
        ChangeDecor = require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/change.js");
        type = require("type-component/index.js");
        dref = require("dref/lib/index.js");
        ModelAttrBinding = function(_super) {
            __extends(ModelAttrBinding, _super);
            function ModelAttrBinding() {
                this._elementValue = __bind(this._elementValue, this);
                this._onValueChange = __bind(this._onValueChange, this);
                this._onChange = __bind(this._onChange, this);
                this._onElementChange = __bind(this._onElementChange, this);
                _ref = ModelAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ModelAttrBinding.prototype.bind = function() {
                ModelAttrBinding.__super__.bind.apply(this, arguments);
                (this.$element = $(this.node)).bind(ChangeDecor.events, this._onElementChange);
                this._onChange();
                return this.clip.context.bind("name", this._onChange);
            };
            ModelAttrBinding.prototype._onElementChange = function(event) {
                var _this = this;
                event.stopPropagation();
                clearTimeout(this._changeTimeout);
                return this._changeTimeout = setTimeout(function() {
                    var model, name, ref, refs, value;
                    value = _this._parseValue(_this._elementValue());
                    name = _this._elementName();
                    refs = _this.script.script.refs;
                    model = _this.clip.get("model");
                    if (_this.clip.get("bothWays") !== false) {
                        ref = name || (refs.length ? refs[0] : void 0);
                        if (!name) {
                            model = _this.context;
                        }
                        _this.currentValue = value;
                        if (model) {
                            if (model.set) {
                                return model.set(ref, value);
                            } else {
                                return dref.set(model, ref, value);
                            }
                        }
                    }
                }, 5);
            };
            ModelAttrBinding.prototype.dispose = function() {
                var _ref1, _ref2;
                if ((_ref1 = this._modelBinding) != null) {
                    _ref1.dispose();
                }
                return (_ref2 = this.$element) != null ? _ref2.unbind(ChangeDecor.events, this._onElementChange) : void 0;
            };
            ModelAttrBinding.prototype._onChange = function() {
                var model, name, _ref1;
                model = this.clip.get("model");
                name = this._elementName();
                if ((_ref1 = this._modelBinding) != null) {
                    _ref1.dispose();
                }
                if (name) {
                    return this._modelBinding = model != null ? model.bind(name).to(this._onValueChange).now() : void 0;
                } else if (type(model) !== "object") {
                    return this._onValueChange(model);
                }
            };
            ModelAttrBinding.prototype._onValueChange = function(value) {
                return this._elementValue(this._parseValue(value));
            };
            ModelAttrBinding.prototype._parseValue = function(value) {
                var v;
                if (value == null || value === "") {
                    return void 0;
                }
                if (type(value) !== "string") {
                    return value;
                }
                if (isNaN(v = Number(value)) || String(value).substr(0, 1) === "0" && String(value).length > 1) {
                    return value;
                } else {
                    return v;
                }
            };
            ModelAttrBinding.prototype._elementValue = function(value) {
                var isInput;
                if (value == null) {
                    value = "";
                }
                isInput = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());
                if (!arguments.length) {
                    if (isInput) {
                        return this._checkedOrValue();
                    } else {
                        return this.node.innerHTML;
                    }
                }
                if (this.currentValue === value) {
                    return;
                }
                this.currentValue = value;
                if (isInput) {
                    return this._checkedOrValue(value);
                } else {
                    return this.node.innerHTML = value;
                }
            };
            ModelAttrBinding.prototype._elementName = function() {
                return $(this.node).attr("name");
            };
            ModelAttrBinding.prototype._checkedOrValue = function(value) {
                var isCheckbox, isRadio, isRadioOrCheckbox;
                isCheckbox = /checkbox/.test(this.node.type);
                isRadio = /radio/.test(this.node.type);
                isRadioOrCheckbox = isCheckbox || isRadio;
                if (!arguments.length) {
                    if (isRadioOrCheckbox) {
                        return Boolean($(this.node).is(":checked"));
                    } else {
                        return this.node.value;
                    }
                }
                if (isRadioOrCheckbox) {
                    if (isRadio) {
                        if (String(value) === String($(this.node).val())) {
                            return $(this.node).prop("checked", true);
                        }
                    } else {
                        return this.node.checked = value;
                    }
                } else {
                    return this.node.value = value;
                }
            };
            return ModelAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js"));
        module.exports = ModelAttrBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js", function(require, module, exports, __dirname, __filename) {
        var EventDecor, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        EventDecor = function(_super) {
            __extends(EventDecor, _super);
            function EventDecor() {
                this._onEvent = __bind(this._onEvent, this);
                _ref = EventDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            EventDecor.prototype.watch = false;
            EventDecor.prototype.propagateEvent = true;
            EventDecor.prototype.preventDefault = false;
            EventDecor.prototype.bind = function() {
                var ev, event, name, prop, _i, _len, _ref1;
                EventDecor.__super__.bind.apply(this, arguments);
                event = (this.event || this.name).toLowerCase();
                name = this.name.toLowerCase();
                if (name.substr(0, 2) === "on") {
                    name = name.substr(2);
                }
                if (event.substr(0, 2) === "on") {
                    event = event.substr(2);
                }
                if (name === "click" || name === "mouseup" || name === "mousedown" || name === "submit") {
                    this.preventDefault = true;
                    this.propagateEvent = false;
                }
                this._pge = "propagateEvent." + name;
                this._pde = "preventDefault." + name;
                _ref1 = [ this._pge, this._pde ];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    ev = _ref1[_i];
                    prop = ev.split(".").shift();
                    if (this.clip.get(ev) == null && this.clip.get(prop) == null && this[prop] != null) {
                        this.clip.set(ev, this[prop]);
                    }
                }
                return $(this.node).bind(event, this._onEvent);
            };
            EventDecor.prototype._onEvent = function(event) {
                if (this.clip.get("propagateEvent") !== true && this.clip.get(this._pge) !== true) {
                    event.stopPropagation();
                }
                if (this.clip.get("preventDefault") === true || this.clip.get(this._pde) === true) {
                    event.preventDefault();
                }
                if (this.clip.get("disable")) {
                    return;
                }
                this.clip.data.set("event", event);
                return this._update(event);
            };
            EventDecor.prototype._update = function(event) {
                return this.script.update();
            };
            return EventDecor;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/base.js"));
        module.exports = EventDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/enter.js", function(require, module, exports, __dirname, __filename) {
        var EnterAttrBinding, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        EnterAttrBinding = function(_super) {
            __extends(EnterAttrBinding, _super);
            function EnterAttrBinding() {
                this._onEvent = __bind(this._onEvent, this);
                _ref = EnterAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            EnterAttrBinding.prototype.event = "keydown";
            EnterAttrBinding.prototype.preventDefault = true;
            EnterAttrBinding.prototype._onEvent = function(event) {
                if (event.keyCode !== 13) {
                    return;
                }
                return EnterAttrBinding.__super__._onEvent.call(this, event);
            };
            return EnterAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"));
        module.exports = EnterAttrBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/delete.js", function(require, module, exports, __dirname, __filename) {
        var DeleteAttrBinding, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        DeleteAttrBinding = function(_super) {
            __extends(DeleteAttrBinding, _super);
            function DeleteAttrBinding() {
                this._onEvent = __bind(this._onEvent, this);
                _ref = DeleteAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            DeleteAttrBinding.prototype.event = "keydown";
            DeleteAttrBinding.prototype.preventDefault = true;
            DeleteAttrBinding.prototype._onEvent = function(event) {
                var _ref1;
                if ((_ref1 = event.keyCode) !== 8) {
                    return;
                }
                return DeleteAttrBinding.__super__._onEvent.call(this, event);
            };
            return DeleteAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"));
        module.exports = DeleteAttrBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/change.js", function(require, module, exports, __dirname, __filename) {
        var ChangeAttrBinding, _ref, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        }, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        ChangeAttrBinding = function(_super) {
            __extends(ChangeAttrBinding, _super);
            function ChangeAttrBinding() {
                this._update2 = __bind(this._update2, this);
                _ref = ChangeAttrBinding.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ChangeAttrBinding.events = "keydown change input mousedown mouseup click";
            ChangeAttrBinding.prototype.preventDefault = false;
            ChangeAttrBinding.prototype.event = ChangeAttrBinding.events;
            ChangeAttrBinding.prototype._update = function(event) {
                clearTimeout(this._changeTimeout);
                return this._changeTimeout = setTimeout(this._update2, 5);
            };
            ChangeAttrBinding.prototype._update2 = function() {
                return this.script.update();
            };
            return ChangeAttrBinding;
        }(require("paperclip/lib/paper/bindings/node/attrs/dataBind/handlers/event.js"));
        module.exports = ChangeAttrBinding;
        return module.exports;
    });
    define("bindable/lib/object/setters/base.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var utils;
            utils = require("bindable/lib/core/utils.js");
            module.exports = function() {
                function _Class(binding) {
                    this.binding = binding;
                    this._map = binding.map();
                }
                _Class.prototype.change = function(values) {
                    var oldValue, value, _ref;
                    value = (_ref = this._map).to.apply(_ref, values);
                    if (this._value === value) {
                        return false;
                    }
                    oldValue = this._value;
                    this._value = value;
                    this._change(value, oldValue);
                    return true;
                };
                _Class.prototype.bothWays = function() {};
                _Class.prototype._change = function(value) {};
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/fn.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.init = function() {
                    return _Class.__super__.init.call(this);
                };
                _Class.prototype.now = function() {
                    if (this._initialized) {
                        return;
                    }
                    return this._initialized = true;
                };
                _Class.prototype._change = function(method, item, oldItems) {
                    return this.target(method, item, oldItems);
                };
                return _Class;
            }(require("bindable/lib/collection/setters/base.js"));
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/object.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var FnSetter, _, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            _ = require("underscore/underscore.js");
            FnSetter = require("bindable/lib/collection/setters/fn.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.init = function() {
                    var _this = this;
                    _.defaults(this.target, {
                        insert: function(item) {},
                        remove: function(item) {},
                        reset: function(item) {}
                    });
                    return this._setter = new FnSetter(this.binding, function(method, item, index) {
                        return _this.target[method].call(_this.target, item, index);
                    });
                };
                _Class.prototype.now = function() {
                    return this._setter.now();
                };
                _Class.prototype._change = function() {
                    return this._setter._change.apply(this._setter, arguments);
                };
                return _Class;
            }(require("bindable/lib/collection/setters/base.js"));
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/collection.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var ObjSetter, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            ObjSetter = require("bindable/lib/collection/setters/object.js");
            module.exports = function(_super) {
                __extends(_Class, _super);
                function _Class() {
                    _ref = _Class.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                _Class.prototype.init = function() {
                    var methods, _this = this;
                    _Class.__super__.init.call(this);
                    return this._setter = new ObjSetter(this.binding, methods = {
                        insert: function(item) {
                            if (_this.binding._copyId) {
                                _this.target._id(_this.binding._from._id());
                            }
                            if (~_this.target.indexOf(item)) {
                                return methods.update(item);
                            } else {
                                return _this.target.push(item);
                            }
                        },
                        update: function(item) {
                            return _this.target.update(item);
                        },
                        reset: function(items, oldItems) {
                            var item, _i, _j, _len, _len1, _results;
                            for (_i = 0, _len = oldItems.length; _i < _len; _i++) {
                                item = oldItems[_i];
                                _this.target.remove(item);
                            }
                            _results = [];
                            for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
                                item = items[_j];
                                _results.push(methods.insert(item));
                            }
                            return _results;
                        },
                        remove: function(item) {
                            var index;
                            index = _this.target.indexOf(item);
                            if (~index) {
                                return _this.target.splice(index, 1);
                            }
                        }
                    });
                };
                _Class.prototype.now = function() {
                    return this._setter.now();
                };
                _Class.prototype._change = function() {
                    return this._setter._change.apply(this._setter, arguments);
                };
                _Class.prototype.bothWays = function() {
                    throw new Error("cannot bind both ways yet");
                };
                return _Class;
            }(require("bindable/lib/collection/setters/base.js"));
        }).call(this);
        return module.exports;
    });
    define("async/lib/async.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var async = {};
            var root, previous_async;
            root = this;
            if (root != null) {
                previous_async = root.async;
            }
            async.noConflict = function() {
                root.async = previous_async;
                return async;
            };
            function only_once(fn) {
                var called = false;
                return function() {
                    if (called) throw new Error("Callback was already called.");
                    called = true;
                    fn.apply(root, arguments);
                };
            }
            var _each = function(arr, iterator) {
                if (arr.forEach) {
                    return arr.forEach(iterator);
                }
                for (var i = 0; i < arr.length; i += 1) {
                    iterator(arr[i], i, arr);
                }
            };
            var _map = function(arr, iterator) {
                if (arr.map) {
                    return arr.map(iterator);
                }
                var results = [];
                _each(arr, function(x, i, a) {
                    results.push(iterator(x, i, a));
                });
                return results;
            };
            var _reduce = function(arr, iterator, memo) {
                if (arr.reduce) {
                    return arr.reduce(iterator, memo);
                }
                _each(arr, function(x, i, a) {
                    memo = iterator(memo, x, i, a);
                });
                return memo;
            };
            var _keys = function(obj) {
                if (Object.keys) {
                    return Object.keys(obj);
                }
                var keys = [];
                for (var k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
                return keys;
            };
            if (typeof process === "undefined" || !process.nextTick) {
                if (typeof setImmediate === "function") {
                    async.nextTick = function(fn) {
                        setImmediate(fn);
                    };
                    async.setImmediate = async.nextTick;
                } else {
                    async.nextTick = function(fn) {
                        setTimeout(fn, 0);
                    };
                    async.setImmediate = async.nextTick;
                }
            } else {
                async.nextTick = process.nextTick;
                if (typeof setImmediate !== "undefined") {
                    async.setImmediate = setImmediate;
                } else {
                    async.setImmediate = async.nextTick;
                }
            }
            async.each = function(arr, iterator, callback) {
                callback = callback || function() {};
                if (!arr.length) {
                    return callback();
                }
                var completed = 0;
                _each(arr, function(x) {
                    iterator(x, only_once(function(err) {
                        if (err) {
                            callback(err);
                            callback = function() {};
                        } else {
                            completed += 1;
                            if (completed >= arr.length) {
                                callback(null);
                            }
                        }
                    }));
                });
            };
            async.forEach = async.each;
            async.eachSeries = function(arr, iterator, callback) {
                callback = callback || function() {};
                if (!arr.length) {
                    return callback();
                }
                var completed = 0;
                var iterate = function() {
                    iterator(arr[completed], function(err) {
                        if (err) {
                            callback(err);
                            callback = function() {};
                        } else {
                            completed += 1;
                            if (completed >= arr.length) {
                                callback(null);
                            } else {
                                iterate();
                            }
                        }
                    });
                };
                iterate();
            };
            async.forEachSeries = async.eachSeries;
            async.eachLimit = function(arr, limit, iterator, callback) {
                var fn = _eachLimit(limit);
                fn.apply(null, [ arr, iterator, callback ]);
            };
            async.forEachLimit = async.eachLimit;
            var _eachLimit = function(limit) {
                return function(arr, iterator, callback) {
                    callback = callback || function() {};
                    if (!arr.length || limit <= 0) {
                        return callback();
                    }
                    var completed = 0;
                    var started = 0;
                    var running = 0;
                    (function replenish() {
                        if (completed >= arr.length) {
                            return callback();
                        }
                        while (running < limit && started < arr.length) {
                            started += 1;
                            running += 1;
                            iterator(arr[started - 1], function(err) {
                                if (err) {
                                    callback(err);
                                    callback = function() {};
                                } else {
                                    completed += 1;
                                    running -= 1;
                                    if (completed >= arr.length) {
                                        callback();
                                    } else {
                                        replenish();
                                    }
                                }
                            });
                        }
                    })();
                };
            };
            var doParallel = function(fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    return fn.apply(null, [ async.each ].concat(args));
                };
            };
            var doParallelLimit = function(limit, fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    return fn.apply(null, [ _eachLimit(limit) ].concat(args));
                };
            };
            var doSeries = function(fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    return fn.apply(null, [ async.eachSeries ].concat(args));
                };
            };
            var _asyncMap = function(eachfn, arr, iterator, callback) {
                var results = [];
                arr = _map(arr, function(x, i) {
                    return {
                        index: i,
                        value: x
                    };
                });
                eachfn(arr, function(x, callback) {
                    iterator(x.value, function(err, v) {
                        results[x.index] = v;
                        callback(err);
                    });
                }, function(err) {
                    callback(err, results);
                });
            };
            async.map = doParallel(_asyncMap);
            async.mapSeries = doSeries(_asyncMap);
            async.mapLimit = function(arr, limit, iterator, callback) {
                return _mapLimit(limit)(arr, iterator, callback);
            };
            var _mapLimit = function(limit) {
                return doParallelLimit(limit, _asyncMap);
            };
            async.reduce = function(arr, memo, iterator, callback) {
                async.eachSeries(arr, function(x, callback) {
                    iterator(memo, x, function(err, v) {
                        memo = v;
                        callback(err);
                    });
                }, function(err) {
                    callback(err, memo);
                });
            };
            async.inject = async.reduce;
            async.foldl = async.reduce;
            async.reduceRight = function(arr, memo, iterator, callback) {
                var reversed = _map(arr, function(x) {
                    return x;
                }).reverse();
                async.reduce(reversed, memo, iterator, callback);
            };
            async.foldr = async.reduceRight;
            var _filter = function(eachfn, arr, iterator, callback) {
                var results = [];
                arr = _map(arr, function(x, i) {
                    return {
                        index: i,
                        value: x
                    };
                });
                eachfn(arr, function(x, callback) {
                    iterator(x.value, function(v) {
                        if (v) {
                            results.push(x);
                        }
                        callback();
                    });
                }, function(err) {
                    callback(_map(results.sort(function(a, b) {
                        return a.index - b.index;
                    }), function(x) {
                        return x.value;
                    }));
                });
            };
            async.filter = doParallel(_filter);
            async.filterSeries = doSeries(_filter);
            async.select = async.filter;
            async.selectSeries = async.filterSeries;
            var _reject = function(eachfn, arr, iterator, callback) {
                var results = [];
                arr = _map(arr, function(x, i) {
                    return {
                        index: i,
                        value: x
                    };
                });
                eachfn(arr, function(x, callback) {
                    iterator(x.value, function(v) {
                        if (!v) {
                            results.push(x);
                        }
                        callback();
                    });
                }, function(err) {
                    callback(_map(results.sort(function(a, b) {
                        return a.index - b.index;
                    }), function(x) {
                        return x.value;
                    }));
                });
            };
            async.reject = doParallel(_reject);
            async.rejectSeries = doSeries(_reject);
            var _detect = function(eachfn, arr, iterator, main_callback) {
                eachfn(arr, function(x, callback) {
                    iterator(x, function(result) {
                        if (result) {
                            main_callback(x);
                            main_callback = function() {};
                        } else {
                            callback();
                        }
                    });
                }, function(err) {
                    main_callback();
                });
            };
            async.detect = doParallel(_detect);
            async.detectSeries = doSeries(_detect);
            async.some = function(arr, iterator, main_callback) {
                async.each(arr, function(x, callback) {
                    iterator(x, function(v) {
                        if (v) {
                            main_callback(true);
                            main_callback = function() {};
                        }
                        callback();
                    });
                }, function(err) {
                    main_callback(false);
                });
            };
            async.any = async.some;
            async.every = function(arr, iterator, main_callback) {
                async.each(arr, function(x, callback) {
                    iterator(x, function(v) {
                        if (!v) {
                            main_callback(false);
                            main_callback = function() {};
                        }
                        callback();
                    });
                }, function(err) {
                    main_callback(true);
                });
            };
            async.all = async.every;
            async.sortBy = function(arr, iterator, callback) {
                async.map(arr, function(x, callback) {
                    iterator(x, function(err, criteria) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, {
                                value: x,
                                criteria: criteria
                            });
                        }
                    });
                }, function(err, results) {
                    if (err) {
                        return callback(err);
                    } else {
                        var fn = function(left, right) {
                            var a = left.criteria, b = right.criteria;
                            return a < b ? -1 : a > b ? 1 : 0;
                        };
                        callback(null, _map(results.sort(fn), function(x) {
                            return x.value;
                        }));
                    }
                });
            };
            async.auto = function(tasks, callback) {
                callback = callback || function() {};
                var keys = _keys(tasks);
                if (!keys.length) {
                    return callback(null);
                }
                var results = {};
                var listeners = [];
                var addListener = function(fn) {
                    listeners.unshift(fn);
                };
                var removeListener = function(fn) {
                    for (var i = 0; i < listeners.length; i += 1) {
                        if (listeners[i] === fn) {
                            listeners.splice(i, 1);
                            return;
                        }
                    }
                };
                var taskComplete = function() {
                    _each(listeners.slice(0), function(fn) {
                        fn();
                    });
                };
                addListener(function() {
                    if (_keys(results).length === keys.length) {
                        callback(null, results);
                        callback = function() {};
                    }
                });
                _each(keys, function(k) {
                    var task = tasks[k] instanceof Function ? [ tasks[k] ] : tasks[k];
                    var taskCallback = function(err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        if (err) {
                            var safeResults = {};
                            _each(_keys(results), function(rkey) {
                                safeResults[rkey] = results[rkey];
                            });
                            safeResults[k] = args;
                            callback(err, safeResults);
                            callback = function() {};
                        } else {
                            results[k] = args;
                            async.setImmediate(taskComplete);
                        }
                    };
                    var requires = task.slice(0, Math.abs(task.length - 1)) || [];
                    var ready = function() {
                        return _reduce(requires, function(a, x) {
                            return a && results.hasOwnProperty(x);
                        }, true) && !results.hasOwnProperty(k);
                    };
                    if (ready()) {
                        task[task.length - 1](taskCallback, results);
                    } else {
                        var listener = function() {
                            if (ready()) {
                                removeListener(listener);
                                task[task.length - 1](taskCallback, results);
                            }
                        };
                        addListener(listener);
                    }
                });
            };
            async.waterfall = function(tasks, callback) {
                callback = callback || function() {};
                if (tasks.constructor !== Array) {
                    var err = new Error("First argument to waterfall must be an array of functions");
                    return callback(err);
                }
                if (!tasks.length) {
                    return callback();
                }
                var wrapIterator = function(iterator) {
                    return function(err) {
                        if (err) {
                            callback.apply(null, arguments);
                            callback = function() {};
                        } else {
                            var args = Array.prototype.slice.call(arguments, 1);
                            var next = iterator.next();
                            if (next) {
                                args.push(wrapIterator(next));
                            } else {
                                args.push(callback);
                            }
                            async.setImmediate(function() {
                                iterator.apply(null, args);
                            });
                        }
                    };
                };
                wrapIterator(async.iterator(tasks))();
            };
            var _parallel = function(eachfn, tasks, callback) {
                callback = callback || function() {};
                if (tasks.constructor === Array) {
                    eachfn.map(tasks, function(fn, callback) {
                        if (fn) {
                            fn(function(err) {
                                var args = Array.prototype.slice.call(arguments, 1);
                                if (args.length <= 1) {
                                    args = args[0];
                                }
                                callback.call(null, err, args);
                            });
                        }
                    }, callback);
                } else {
                    var results = {};
                    eachfn.each(_keys(tasks), function(k, callback) {
                        tasks[k](function(err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            results[k] = args;
                            callback(err);
                        });
                    }, function(err) {
                        callback(err, results);
                    });
                }
            };
            async.parallel = function(tasks, callback) {
                _parallel({
                    map: async.map,
                    each: async.each
                }, tasks, callback);
            };
            async.parallelLimit = function(tasks, limit, callback) {
                _parallel({
                    map: _mapLimit(limit),
                    each: _eachLimit(limit)
                }, tasks, callback);
            };
            async.series = function(tasks, callback) {
                callback = callback || function() {};
                if (tasks.constructor === Array) {
                    async.mapSeries(tasks, function(fn, callback) {
                        if (fn) {
                            fn(function(err) {
                                var args = Array.prototype.slice.call(arguments, 1);
                                if (args.length <= 1) {
                                    args = args[0];
                                }
                                callback.call(null, err, args);
                            });
                        }
                    }, callback);
                } else {
                    var results = {};
                    async.eachSeries(_keys(tasks), function(k, callback) {
                        tasks[k](function(err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            results[k] = args;
                            callback(err);
                        });
                    }, function(err) {
                        callback(err, results);
                    });
                }
            };
            async.iterator = function(tasks) {
                var makeCallback = function(index) {
                    var fn = function() {
                        if (tasks.length) {
                            tasks[index].apply(null, arguments);
                        }
                        return fn.next();
                    };
                    fn.next = function() {
                        return index < tasks.length - 1 ? makeCallback(index + 1) : null;
                    };
                    return fn;
                };
                return makeCallback(0);
            };
            async.apply = function(fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                return function() {
                    return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)));
                };
            };
            var _concat = function(eachfn, arr, fn, callback) {
                var r = [];
                eachfn(arr, function(x, cb) {
                    fn(x, function(err, y) {
                        r = r.concat(y || []);
                        cb(err);
                    });
                }, function(err) {
                    callback(err, r);
                });
            };
            async.concat = doParallel(_concat);
            async.concatSeries = doSeries(_concat);
            async.whilst = function(test, iterator, callback) {
                if (test()) {
                    iterator(function(err) {
                        if (err) {
                            return callback(err);
                        }
                        async.whilst(test, iterator, callback);
                    });
                } else {
                    callback();
                }
            };
            async.doWhilst = function(iterator, test, callback) {
                iterator(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    if (test()) {
                        async.doWhilst(iterator, test, callback);
                    } else {
                        callback();
                    }
                });
            };
            async.until = function(test, iterator, callback) {
                if (!test()) {
                    iterator(function(err) {
                        if (err) {
                            return callback(err);
                        }
                        async.until(test, iterator, callback);
                    });
                } else {
                    callback();
                }
            };
            async.doUntil = function(iterator, test, callback) {
                iterator(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    if (!test()) {
                        async.doUntil(iterator, test, callback);
                    } else {
                        callback();
                    }
                });
            };
            async.queue = function(worker, concurrency) {
                if (concurrency === undefined) {
                    concurrency = 1;
                }
                function _insert(q, data, pos, callback) {
                    if (data.constructor !== Array) {
                        data = [ data ];
                    }
                    _each(data, function(task) {
                        var item = {
                            data: task,
                            callback: typeof callback === "function" ? callback : null
                        };
                        if (pos) {
                            q.tasks.unshift(item);
                        } else {
                            q.tasks.push(item);
                        }
                        if (q.saturated && q.tasks.length === concurrency) {
                            q.saturated();
                        }
                        async.setImmediate(q.process);
                    });
                }
                var workers = 0;
                var q = {
                    tasks: [],
                    concurrency: concurrency,
                    saturated: null,
                    empty: null,
                    drain: null,
                    push: function(data, callback) {
                        _insert(q, data, false, callback);
                    },
                    unshift: function(data, callback) {
                        _insert(q, data, true, callback);
                    },
                    process: function() {
                        if (workers < q.concurrency && q.tasks.length) {
                            var task = q.tasks.shift();
                            if (q.empty && q.tasks.length === 0) {
                                q.empty();
                            }
                            workers += 1;
                            var next = function() {
                                workers -= 1;
                                if (task.callback) {
                                    task.callback.apply(task, arguments);
                                }
                                if (q.drain && q.tasks.length + workers === 0) {
                                    q.drain();
                                }
                                q.process();
                            };
                            var cb = only_once(next);
                            worker(task.data, cb);
                        }
                    },
                    length: function() {
                        return q.tasks.length;
                    },
                    running: function() {
                        return workers;
                    }
                };
                return q;
            };
            async.cargo = function(worker, payload) {
                var working = false, tasks = [];
                var cargo = {
                    tasks: tasks,
                    payload: payload,
                    saturated: null,
                    empty: null,
                    drain: null,
                    push: function(data, callback) {
                        if (data.constructor !== Array) {
                            data = [ data ];
                        }
                        _each(data, function(task) {
                            tasks.push({
                                data: task,
                                callback: typeof callback === "function" ? callback : null
                            });
                            if (cargo.saturated && tasks.length === payload) {
                                cargo.saturated();
                            }
                        });
                        async.setImmediate(cargo.process);
                    },
                    process: function process() {
                        if (working) return;
                        if (tasks.length === 0) {
                            if (cargo.drain) cargo.drain();
                            return;
                        }
                        var ts = typeof payload === "number" ? tasks.splice(0, payload) : tasks.splice(0);
                        var ds = _map(ts, function(task) {
                            return task.data;
                        });
                        if (cargo.empty) cargo.empty();
                        working = true;
                        worker(ds, function() {
                            working = false;
                            var args = arguments;
                            _each(ts, function(data) {
                                if (data.callback) {
                                    data.callback.apply(null, args);
                                }
                            });
                            process();
                        });
                    },
                    length: function() {
                        return tasks.length;
                    },
                    running: function() {
                        return working;
                    }
                };
                return cargo;
            };
            var _console_fn = function(name) {
                return function(fn) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    fn.apply(null, args.concat([ function(err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (typeof console !== "undefined") {
                            if (err) {
                                if (console.error) {
                                    console.error(err);
                                }
                            } else if (console[name]) {
                                _each(args, function(x) {
                                    console[name](x);
                                });
                            }
                        }
                    } ]));
                };
            };
            async.log = _console_fn("log");
            async.dir = _console_fn("dir");
            async.memoize = function(fn, hasher) {
                var memo = {};
                var queues = {};
                hasher = hasher || function(x) {
                    return x;
                };
                var memoized = function() {
                    var args = Array.prototype.slice.call(arguments);
                    var callback = args.pop();
                    var key = hasher.apply(null, args);
                    if (key in memo) {
                        callback.apply(null, memo[key]);
                    } else if (key in queues) {
                        queues[key].push(callback);
                    } else {
                        queues[key] = [ callback ];
                        fn.apply(null, args.concat([ function() {
                            memo[key] = arguments;
                            var q = queues[key];
                            delete queues[key];
                            for (var i = 0, l = q.length; i < l; i++) {
                                q[i].apply(null, arguments);
                            }
                        } ]));
                    }
                };
                memoized.memo = memo;
                memoized.unmemoized = fn;
                return memoized;
            };
            async.unmemoize = function(fn) {
                return function() {
                    return (fn.unmemoized || fn).apply(null, arguments);
                };
            };
            async.times = function(count, iterator, callback) {
                var counter = [];
                for (var i = 0; i < count; i++) {
                    counter.push(i);
                }
                return async.map(counter, iterator, callback);
            };
            async.timesSeries = function(count, iterator, callback) {
                var counter = [];
                for (var i = 0; i < count; i++) {
                    counter.push(i);
                }
                return async.mapSeries(counter, iterator, callback);
            };
            async.compose = function() {
                var fns = Array.prototype.reverse.call(arguments);
                return function() {
                    var that = this;
                    var args = Array.prototype.slice.call(arguments);
                    var callback = args.pop();
                    async.reduce(fns, args, function(newargs, fn, cb) {
                        fn.apply(that, newargs.concat([ function() {
                            var err = arguments[0];
                            var nextargs = Array.prototype.slice.call(arguments, 1);
                            cb(err, nextargs);
                        } ]));
                    }, function(err, results) {
                        callback.apply(that, [ err ].concat(results));
                    });
                };
            };
            var _applyEach = function(eachfn, fns) {
                var go = function() {
                    var that = this;
                    var args = Array.prototype.slice.call(arguments);
                    var callback = args.pop();
                    return eachfn(fns, function(fn, cb) {
                        fn.apply(that, args.concat([ cb ]));
                    }, callback);
                };
                if (arguments.length > 2) {
                    var args = Array.prototype.slice.call(arguments, 2);
                    return go.apply(this, args);
                } else {
                    return go;
                }
            };
            async.applyEach = doParallel(_applyEach);
            async.applyEachSeries = doSeries(_applyEach);
            async.forever = function(fn, callback) {
                function next(err) {
                    if (err) {
                        if (callback) {
                            return callback(err);
                        }
                        throw err;
                    }
                    fn(next);
                }
                next();
            };
            if (typeof define !== "undefined" && define.amd) {
                define([], function() {
                    return async;
                });
            } else if (typeof module !== "undefined" && module.exports) {
                module.exports = async;
            } else {
                root.async = async;
            }
        })();
        return module.exports;
    });
    define("underscore/underscore.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var root = this;
            var previousUnderscore = root._;
            var breaker = {};
            var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
            var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
            var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
            var _ = function(obj) {
                if (obj instanceof _) return obj;
                if (!(this instanceof _)) return new _(obj);
                this._wrapped = obj;
            };
            if (typeof exports !== "undefined") {
                if (typeof module !== "undefined" && module.exports) {
                    exports = module.exports = _;
                }
                exports._ = _;
            } else {
                root._ = _;
            }
            _.VERSION = "1.4.4";
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
            _.map = _.collect = function(obj, iterator, context) {
                var results = [];
                if (obj == null) return results;
                if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
                each(obj, function(value, index, list) {
                    results[results.length] = iterator.call(context, value, index, list);
                });
                return results;
            };
            var reduceError = "Reduce of empty array with no initial value";
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
            _.filter = _.select = function(obj, iterator, context) {
                var results = [];
                if (obj == null) return results;
                if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
                each(obj, function(value, index, list) {
                    if (iterator.call(context, value, index, list)) results[results.length] = value;
                });
                return results;
            };
            _.reject = function(obj, iterator, context) {
                return _.filter(obj, function(value, index, list) {
                    return !iterator.call(context, value, index, list);
                }, context);
            };
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
            _.contains = _.include = function(obj, target) {
                if (obj == null) return false;
                if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
                return any(obj, function(value) {
                    return value === target;
                });
            };
            _.invoke = function(obj, method) {
                var args = slice.call(arguments, 2);
                var isFunc = _.isFunction(method);
                return _.map(obj, function(value) {
                    return (isFunc ? method : value[method]).apply(value, args);
                });
            };
            _.pluck = function(obj, key) {
                return _.map(obj, function(value) {
                    return value[key];
                });
            };
            _.where = function(obj, attrs, first) {
                if (_.isEmpty(attrs)) return first ? null : [];
                return _[first ? "find" : "filter"](obj, function(value) {
                    for (var key in attrs) {
                        if (attrs[key] !== value[key]) return false;
                    }
                    return true;
                });
            };
            _.findWhere = function(obj, attrs) {
                return _.where(obj, attrs, true);
            };
            _.max = function(obj, iterator, context) {
                if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                    return Math.max.apply(Math, obj);
                }
                if (!iterator && _.isEmpty(obj)) return -Infinity;
                var result = {
                    computed: -Infinity,
                    value: -Infinity
                };
                each(obj, function(value, index, list) {
                    var computed = iterator ? iterator.call(context, value, index, list) : value;
                    computed >= result.computed && (result = {
                        value: value,
                        computed: computed
                    });
                });
                return result.value;
            };
            _.min = function(obj, iterator, context) {
                if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                    return Math.min.apply(Math, obj);
                }
                if (!iterator && _.isEmpty(obj)) return Infinity;
                var result = {
                    computed: Infinity,
                    value: Infinity
                };
                each(obj, function(value, index, list) {
                    var computed = iterator ? iterator.call(context, value, index, list) : value;
                    computed < result.computed && (result = {
                        value: value,
                        computed: computed
                    });
                });
                return result.value;
            };
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
            var lookupIterator = function(value) {
                return _.isFunction(value) ? value : function(obj) {
                    return obj[value];
                };
            };
            _.sortBy = function(obj, value, context) {
                var iterator = lookupIterator(value);
                return _.pluck(_.map(obj, function(value, index, list) {
                    return {
                        value: value,
                        index: index,
                        criteria: iterator.call(context, value, index, list)
                    };
                }).sort(function(left, right) {
                    var a = left.criteria;
                    var b = right.criteria;
                    if (a !== b) {
                        if (a > b || a === void 0) return 1;
                        if (a < b || b === void 0) return -1;
                    }
                    return left.index < right.index ? -1 : 1;
                }), "value");
            };
            var group = function(obj, value, context, behavior) {
                var result = {};
                var iterator = lookupIterator(value || _.identity);
                each(obj, function(value, index) {
                    var key = iterator.call(context, value, index, obj);
                    behavior(result, key, value);
                });
                return result;
            };
            _.groupBy = function(obj, value, context) {
                return group(obj, value, context, function(result, key, value) {
                    (_.has(result, key) ? result[key] : result[key] = []).push(value);
                });
            };
            _.countBy = function(obj, value, context) {
                return group(obj, value, context, function(result, key) {
                    if (!_.has(result, key)) result[key] = 0;
                    result[key]++;
                });
            };
            _.sortedIndex = function(array, obj, iterator, context) {
                iterator = iterator == null ? _.identity : lookupIterator(iterator);
                var value = iterator.call(context, obj);
                var low = 0, high = array.length;
                while (low < high) {
                    var mid = low + high >>> 1;
                    iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
                }
                return low;
            };
            _.toArray = function(obj) {
                if (!obj) return [];
                if (_.isArray(obj)) return slice.call(obj);
                if (obj.length === +obj.length) return _.map(obj, _.identity);
                return _.values(obj);
            };
            _.size = function(obj) {
                if (obj == null) return 0;
                return obj.length === +obj.length ? obj.length : _.keys(obj).length;
            };
            _.first = _.head = _.take = function(array, n, guard) {
                if (array == null) return void 0;
                return n != null && !guard ? slice.call(array, 0, n) : array[0];
            };
            _.initial = function(array, n, guard) {
                return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
            };
            _.last = function(array, n, guard) {
                if (array == null) return void 0;
                if (n != null && !guard) {
                    return slice.call(array, Math.max(array.length - n, 0));
                } else {
                    return array[array.length - 1];
                }
            };
            _.rest = _.tail = _.drop = function(array, n, guard) {
                return slice.call(array, n == null || guard ? 1 : n);
            };
            _.compact = function(array) {
                return _.filter(array, _.identity);
            };
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
            _.flatten = function(array, shallow) {
                return flatten(array, shallow, []);
            };
            _.without = function(array) {
                return _.difference(array, slice.call(arguments, 1));
            };
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
                    if (isSorted ? !index || seen[seen.length - 1] !== value : !_.contains(seen, value)) {
                        seen.push(value);
                        results.push(array[index]);
                    }
                });
                return results;
            };
            _.union = function() {
                return _.uniq(concat.apply(ArrayProto, arguments));
            };
            _.intersection = function(array) {
                var rest = slice.call(arguments, 1);
                return _.filter(_.uniq(array), function(item) {
                    return _.every(rest, function(other) {
                        return _.indexOf(other, item) >= 0;
                    });
                });
            };
            _.difference = function(array) {
                var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
                return _.filter(array, function(value) {
                    return !_.contains(rest, value);
                });
            };
            _.zip = function() {
                var args = slice.call(arguments);
                var length = _.max(_.pluck(args, "length"));
                var results = new Array(length);
                for (var i = 0; i < length; i++) {
                    results[i] = _.pluck(args, "" + i);
                }
                return results;
            };
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
            _.indexOf = function(array, item, isSorted) {
                if (array == null) return -1;
                var i = 0, l = array.length;
                if (isSorted) {
                    if (typeof isSorted == "number") {
                        i = isSorted < 0 ? Math.max(0, l + isSorted) : isSorted;
                    } else {
                        i = _.sortedIndex(array, item);
                        return array[i] === item ? i : -1;
                    }
                }
                if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
                for (; i < l; i++) if (array[i] === item) return i;
                return -1;
            };
            _.lastIndexOf = function(array, item, from) {
                if (array == null) return -1;
                var hasIndex = from != null;
                if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
                    return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
                }
                var i = hasIndex ? from : array.length;
                while (i--) if (array[i] === item) return i;
                return -1;
            };
            _.range = function(start, stop, step) {
                if (arguments.length <= 1) {
                    stop = start || 0;
                    start = 0;
                }
                step = arguments[2] || 1;
                var len = Math.max(Math.ceil((stop - start) / step), 0);
                var idx = 0;
                var range = new Array(len);
                while (idx < len) {
                    range[idx++] = start;
                    start += step;
                }
                return range;
            };
            _.bind = function(func, context) {
                if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
                var args = slice.call(arguments, 2);
                return function() {
                    return func.apply(context, args.concat(slice.call(arguments)));
                };
            };
            _.partial = function(func) {
                var args = slice.call(arguments, 1);
                return function() {
                    return func.apply(this, args.concat(slice.call(arguments)));
                };
            };
            _.bindAll = function(obj) {
                var funcs = slice.call(arguments, 1);
                if (funcs.length === 0) funcs = _.functions(obj);
                each(funcs, function(f) {
                    obj[f] = _.bind(obj[f], obj);
                });
                return obj;
            };
            _.memoize = function(func, hasher) {
                var memo = {};
                hasher || (hasher = _.identity);
                return function() {
                    var key = hasher.apply(this, arguments);
                    return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
                };
            };
            _.delay = function(func, wait) {
                var args = slice.call(arguments, 2);
                return setTimeout(function() {
                    return func.apply(null, args);
                }, wait);
            };
            _.defer = function(func) {
                return _.delay.apply(_, [ func, 1 ].concat(slice.call(arguments, 1)));
            };
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
            _.wrap = function(func, wrapper) {
                return function() {
                    var args = [ func ];
                    push.apply(args, arguments);
                    return wrapper.apply(this, args);
                };
            };
            _.compose = function() {
                var funcs = arguments;
                return function() {
                    var args = arguments;
                    for (var i = funcs.length - 1; i >= 0; i--) {
                        args = [ funcs[i].apply(this, args) ];
                    }
                    return args[0];
                };
            };
            _.after = function(times, func) {
                if (times <= 0) return func();
                return function() {
                    if (--times < 1) {
                        return func.apply(this, arguments);
                    }
                };
            };
            _.keys = nativeKeys || function(obj) {
                if (obj !== Object(obj)) throw new TypeError("Invalid object");
                var keys = [];
                for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
                return keys;
            };
            _.values = function(obj) {
                var values = [];
                for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
                return values;
            };
            _.pairs = function(obj) {
                var pairs = [];
                for (var key in obj) if (_.has(obj, key)) pairs.push([ key, obj[key] ]);
                return pairs;
            };
            _.invert = function(obj) {
                var result = {};
                for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
                return result;
            };
            _.functions = _.methods = function(obj) {
                var names = [];
                for (var key in obj) {
                    if (_.isFunction(obj[key])) names.push(key);
                }
                return names.sort();
            };
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
            _.pick = function(obj) {
                var copy = {};
                var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                each(keys, function(key) {
                    if (key in obj) copy[key] = obj[key];
                });
                return copy;
            };
            _.omit = function(obj) {
                var copy = {};
                var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                for (var key in obj) {
                    if (!_.contains(keys, key)) copy[key] = obj[key];
                }
                return copy;
            };
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
            _.clone = function(obj) {
                if (!_.isObject(obj)) return obj;
                return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
            };
            _.tap = function(obj, interceptor) {
                interceptor(obj);
                return obj;
            };
            var eq = function(a, b, aStack, bStack) {
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                if (a == null || b == null) return a === b;
                if (a instanceof _) a = a._wrapped;
                if (b instanceof _) b = b._wrapped;
                var className = toString.call(a);
                if (className != toString.call(b)) return false;
                switch (className) {
                  case "[object String]":
                    return a == String(b);
                  case "[object Number]":
                    return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
                  case "[object Date]":
                  case "[object Boolean]":
                    return +a == +b;
                  case "[object RegExp]":
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
                if (typeof a != "object" || typeof b != "object") return false;
                var length = aStack.length;
                while (length--) {
                    if (aStack[length] == a) return bStack[length] == b;
                }
                aStack.push(a);
                bStack.push(b);
                var size = 0, result = true;
                if (className == "[object Array]") {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                        }
                    }
                } else {
                    var aCtor = a.constructor, bCtor = b.constructor;
                    if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                        return false;
                    }
                    for (var key in a) {
                        if (_.has(a, key)) {
                            size++;
                            if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                        }
                    }
                    if (result) {
                        for (key in b) {
                            if (_.has(b, key) && !(size--)) break;
                        }
                        result = !size;
                    }
                }
                aStack.pop();
                bStack.pop();
                return result;
            };
            _.isEqual = function(a, b) {
                return eq(a, b, [], []);
            };
            _.isEmpty = function(obj) {
                if (obj == null) return true;
                if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
                for (var key in obj) if (_.has(obj, key)) return false;
                return true;
            };
            _.isElement = function(obj) {
                return !!(obj && obj.nodeType === 1);
            };
            _.isArray = nativeIsArray || function(obj) {
                return toString.call(obj) == "[object Array]";
            };
            _.isObject = function(obj) {
                return obj === Object(obj);
            };
            each([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(name) {
                _["is" + name] = function(obj) {
                    return toString.call(obj) == "[object " + name + "]";
                };
            });
            if (!_.isArguments(arguments)) {
                _.isArguments = function(obj) {
                    return !!(obj && _.has(obj, "callee"));
                };
            }
            if (typeof /./ !== "function") {
                _.isFunction = function(obj) {
                    return typeof obj === "function";
                };
            }
            _.isFinite = function(obj) {
                return isFinite(obj) && !isNaN(parseFloat(obj));
            };
            _.isNaN = function(obj) {
                return _.isNumber(obj) && obj != +obj;
            };
            _.isBoolean = function(obj) {
                return obj === true || obj === false || toString.call(obj) == "[object Boolean]";
            };
            _.isNull = function(obj) {
                return obj === null;
            };
            _.isUndefined = function(obj) {
                return obj === void 0;
            };
            _.has = function(obj, key) {
                return hasOwnProperty.call(obj, key);
            };
            _.noConflict = function() {
                root._ = previousUnderscore;
                return this;
            };
            _.identity = function(value) {
                return value;
            };
            _.times = function(n, iterator, context) {
                var accum = Array(n);
                for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
                return accum;
            };
            _.random = function(min, max) {
                if (max == null) {
                    max = min;
                    min = 0;
                }
                return min + Math.floor(Math.random() * (max - min + 1));
            };
            var entityMap = {
                escape: {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#x27;",
                    "/": "&#x2F;"
                }
            };
            entityMap.unescape = _.invert(entityMap.escape);
            var entityRegexes = {
                escape: new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"),
                unescape: new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g")
            };
            _.each([ "escape", "unescape" ], function(method) {
                _[method] = function(string) {
                    if (string == null) return "";
                    return ("" + string).replace(entityRegexes[method], function(match) {
                        return entityMap[method][match];
                    });
                };
            });
            _.result = function(object, property) {
                if (object == null) return null;
                var value = object[property];
                return _.isFunction(value) ? value.call(object) : value;
            };
            _.mixin = function(obj) {
                each(_.functions(obj), function(name) {
                    var func = _[name] = obj[name];
                    _.prototype[name] = function() {
                        var args = [ this._wrapped ];
                        push.apply(args, arguments);
                        return result.call(this, func.apply(_, args));
                    };
                });
            };
            var idCounter = 0;
            _.uniqueId = function(prefix) {
                var id = ++idCounter + "";
                return prefix ? prefix + id : id;
            };
            _.templateSettings = {
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: /<%=([\s\S]+?)%>/g,
                escape: /<%-([\s\S]+?)%>/g
            };
            var noMatch = /(.)^/;
            var escapes = {
                "'": "'",
                "\\": "\\",
                "\r": "r",
                "\n": "n",
                "	": "t",
                "\u2028": "u2028",
                "\u2029": "u2029"
            };
            var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
            _.template = function(text, data, settings) {
                var render;
                settings = _.defaults({}, settings, _.templateSettings);
                var matcher = new RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g");
                var index = 0;
                var source = "__p+='";
                text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
                    source += text.slice(index, offset).replace(escaper, function(match) {
                        return "\\" + escapes[match];
                    });
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
                if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";
                source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
                try {
                    render = new Function(settings.variable || "obj", "_", source);
                } catch (e) {
                    e.source = source;
                    throw e;
                }
                if (data) return render(data, _);
                var template = function(data) {
                    return render.call(this, data, _);
                };
                template.source = "function(" + (settings.variable || "obj") + "){\n" + source + "}";
                return template;
            };
            _.chain = function(obj) {
                return _(obj).chain();
            };
            var result = function(obj) {
                return this._chain ? _(obj).chain() : obj;
            };
            _.mixin(_);
            each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(name) {
                var method = ArrayProto[name];
                _.prototype[name] = function() {
                    var obj = this._wrapped;
                    method.apply(obj, arguments);
                    if ((name == "shift" || name == "splice") && obj.length === 0) delete obj[0];
                    return result.call(this, obj);
                };
            });
            each([ "concat", "join", "slice" ], function(name) {
                var method = ArrayProto[name];
                _.prototype[name] = function() {
                    return result.call(this, method.apply(this._wrapped, arguments));
                };
            });
            _.extend(_.prototype, {
                chain: function() {
                    this._chain = true;
                    return this;
                },
                value: function() {
                    return this._wrapped;
                }
            });
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/base.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var async, utils;
            utils = require("bindable/lib/core/utils.js");
            async = require("async/lib/async.js");
            module.exports = function() {
                function _Class(binding, target) {
                    this.binding = binding;
                    this.target = target;
                    this._transformer = binding.transform();
                    this._filter = binding.filter();
                    this.init();
                }
                _Class.prototype.init = function() {};
                _Class.prototype.now = function() {};
                _Class.prototype.dispose = function() {};
                _Class.prototype.change = function(event, item, oldItem) {
                    if (event === "reset") {
                        return this._changeItems(event, item, oldItem);
                    } else {
                        return this._changeItem(event, item, oldItem);
                    }
                };
                _Class.prototype._changeItem = function(event, item, oldItem) {
                    if (this._filter) {
                        if (!this._filter(item)) {
                            return;
                        }
                    }
                    return this._change(event, this._transformer.to(item), oldItem);
                };
                _Class.prototype._changeItems = function(event, items, oldItems) {
                    var changed, i, item, _i, _len;
                    if (this._filter) {
                        changed = items.filter(this._filter);
                    } else {
                        changed = items.concat();
                    }
                    for (i = _i = 0, _len = changed.length; _i < _len; i = ++_i) {
                        item = changed[i];
                        changed[i] = this._transformer.to(item);
                    }
                    return this._change(events, changed, oldItems);
                };
                _Class.prototype._change = function(event, item) {};
                _Class.prototype.bothWays = function() {};
                _Class.prototype.__transform = function(method, value) {
                    return utils.tryTransform(this._transformer, method, [ value ]);
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    var entries = [ "paperclip/lib/index.js" ];
    for (var i = entries.length; i--; ) {
        _require(entries[i]);
    }
})();