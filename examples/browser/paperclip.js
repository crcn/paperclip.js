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
        module.exports = {
            Clip: Clip,
            paper: paper,
            Context: paper.Context,
            bindable: require("bindable/lib/index.js"),
            registerModifier: paper.registerModifier
        };
        if (typeof window !== "undefined") {
            window.paperclip = module.exports;
        }
        return module.exports;
    });
    define("paperclip/lib/clip/index.js", function(require, module, exports, __dirname, __filename) {
        var Clip, ClipScript, ClipScripts, PropertyChain, bindable, dref, events, __bind = function(fn, me) {
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
                    this.watcher._watch(command.ref, cv);
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
                this.watcher.currentRef = this;
                return cv;
            };
            return PropertyChain;
        }();
        ClipScript = function(_super) {
            __extends(ClipScript, _super);
            function ClipScript(script, clip) {
                this.script = script;
                this.clip = clip;
                this.update = __bind(this.update, this);
                this.modifiers = this.clip.modifiers;
                this.options = this.clip.options;
                this._watching = {};
                this.cast = {};
            }
            ClipScript.prototype.dispose = function() {
                var key;
                for (key in this._watching) {
                    this._watching[key].binding.dispose();
                }
                return this._watching = {};
            };
            ClipScript.prototype.update = function() {
                var newValue;
                newValue = this.script.fn.call(this);
                if (newValue === this.value) {
                    return newValue;
                }
                this.emit("change", this.value = newValue);
                return newValue;
            };
            ClipScript.prototype.watch = function() {
                this.__watch = true;
                this.update();
                return this;
            };
            ClipScript.prototype.references = function() {
                if (!this.script.refs) {
                    return [];
                }
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
                if (!this.__watch) {
                    return;
                }
                if (this._watching[path]) {
                    if (this._watching[path].target === target) {
                        return;
                    }
                    this._watching[path].binding.dispose();
                }
                return this._watching[path] = {
                    target: target,
                    binding: target.bind(path).to(this.update)
                };
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
                var scriptName, _results;
                if (scripts.fn) {
                    return this._bindScript("value", scripts);
                } else {
                    _results = [];
                    for (scriptName in scripts) {
                        _results.push(this._bindScript(scriptName, scripts[scriptName]));
                    }
                    return _results;
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
                this._self = new bindable.Object;
                this.reset(options.data, false);
                this.modifiers = options.modifiers || {};
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
            Clip.prototype.update = function() {
                this.scripts.update();
                return this;
            };
            Clip.prototype.dispose = function() {
                var _ref, _ref1;
                if ((_ref = this._self) != null) {
                    _ref.dispose();
                }
                if ((_ref1 = this.scripts) != null) {
                    _ref1.dispose();
                }
                this._self = void 0;
                return this._scripts = void 0;
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
        var Context, Html, Paper, asyngleton, modifiers, pilot;
        Context = require("paperclip/lib/paper/context.js");
        Html = require("paperclip/lib/paper/nodes/html.js");
        pilot = require("pilot-block/lib/index.js");
        asyngleton = require("asyngleton/lib/index.js");
        modifiers = require("paperclip/lib/paper/defaultModifiers.js");
        Paper = function() {
            function Paper(factory) {
                this.factory = factory;
                this.modifiers = modifiers;
                this.node = this.factory(this);
            }
            Paper.prototype.load = function(context) {
                return this.node.load(context);
            };
            Paper.prototype.attach = function(element, context) {
                return this.node.attach(element, context);
            };
            Paper.prototype.create = function() {
                return new Html;
            };
            return Paper;
        }();
        module.exports = function(fn) {
            return new Paper(fn);
        };
        module.exports.Context = Context;
        module.exports.registerModifier = function(name, modifier) {
            return modifiers[name] = modifier;
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
            Binding.Collection = exports.Collection;
        }).call(this);
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
    define("paperclip/lib/paper/context.js", function(require, module, exports, __dirname, __filename) {
        var Context, bindable, pilot, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        pilot = require("pilot-block/lib/index.js");
        Context = function(_super) {
            __extends(Context, _super);
            function Context(data, parent) {
                var _ref, _ref1;
                this.parent = parent;
                Context.__super__.constructor.call(this, data);
                this.set("this", this);
                this.root = ((_ref = this.parent) != null ? _ref.root : void 0) || this;
                this.buffer = ((_ref1 = this.parent) != null ? _ref1.buffer : void 0) || [];
                this.internal = this.root.internal || new bindable.Object;
            }
            Context.prototype.get = function(key) {
                var _ref, _ref1;
                return (_ref = Context.__super__.get.call(this, key)) != null ? _ref : (_ref1 = this.parent) != null ? _ref1.get(key) : void 0;
            };
            Context.prototype.child = function(data) {
                if (data == null) {
                    data = {};
                }
                return new Context(data, this);
            };
            Context.prototype.detachBuffer = function() {
                this.buffer = [];
                return this;
            };
            Context.prototype.attachBuffer = function() {
                this.buffer = this.root.buffer || this.buffer;
                return this;
            };
            return Context;
        }(bindable.Object);
        module.exports = Context;
        return module.exports;
    });
    define("paperclip/lib/paper/nodes/html.js", function(require, module, exports, __dirname, __filename) {
        var Base, BlockBinding, Html, NodeBinding, StringBuffer, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        NodeBinding = require("paperclip/lib/paper/nodes/nodeBinding.js");
        BlockBinding = require("paperclip/lib/paper/nodes/blockBinding.js");
        StringBuffer = require("paperclip/lib/paper/nodes/string.js");
        Base = require("paperclip/lib/paper/nodes/base.js");
        Html = function(_super) {
            __extends(Html, _super);
            function Html() {
                _ref = Html.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            Html.prototype.name = "html";
            Html.prototype.html = function(content) {
                this.addChild(new StringBuffer(content));
                return this;
            };
            Html.prototype.nodeBinding = function(name, options) {
                this.addChild(new NodeBinding(name, options));
                return this;
            };
            Html.prototype.blockBinding = function(script, contentFactory, childBinding) {
                this.addChild(new BlockBinding(script, contentFactory, childBinding));
                return this;
            };
            Html.prototype.textBinding = function(binding) {
                return this.blockBinding(binding);
            };
            Html.prototype.clone = function() {
                var html;
                html = new Html;
                html.children = Base.cloneEach(this.children);
                return html;
            };
            return Html;
        }(Base);
        module.exports = Html;
        return module.exports;
    });
    define("pilot-block/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var Pilot, Section, toarray, utils;
        Section = require("pilot-block/lib/section.js");
        toarray = require("toarray/index.js");
        utils = require("pilot-block/lib/utils.js");
        Pilot = function() {
            function Pilot() {
                this._controllers = {};
                this._sections = {};
                this._bid = 0;
            }
            Pilot.prototype.control = function(name, controller) {
                this._controllers[name] = controller;
                return this._bindController(name);
            };
            Pilot.prototype.section = function(name) {
                return this._sections[name];
            };
            Pilot.prototype.createSection = function(content) {
                var elements;
                if (content == null) {
                    content = "";
                }
                if (typeof content === "string") {
                    elements = utils.createElements(content).childNodes;
                } else {
                    elements = toarray(content);
                }
                return this._blockifyElements(elements);
            };
            Pilot.prototype.controller = function(name) {
                return this._controllers[name];
            };
            Pilot.prototype._removeSection = function(section) {
                if (!this._sections[section.name]) {
                    return;
                }
                delete this._sections[section.name];
                delete this._controllers[section.name];
                return this._removeChildSections(section);
            };
            Pilot.prototype._removeChildSections = function(section) {
                var start, _results, _this = this;
                start = section.start;
                _results = [];
                while (start) {
                    this._traverse(start, function(child) {
                        var sectionName;
                        if (sectionName = _this._controllerNameFromBlock(child)) {
                            delete _this._sections[sectionName];
                            return delete _this._controllers[sectionName];
                        }
                    });
                    _results.push(start = start.nextSibling);
                }
                return _results;
            };
            Pilot.prototype._traverse = function(element, callback) {
                var child, _i, _len, _ref, _results;
                callback(element);
                _ref = element.childNodes;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    _results.push(this._traverse(child, callback));
                }
                return _results;
            };
            Pilot.prototype._blockifyElements = function(elements) {
                var bid, end, first, last, parent, start;
                start = document.createComment("spc:" + (bid = this._generateRandomBlockId()));
                end = document.createComment("epc:" + bid);
                first = elements[0];
                last = elements[elements.length - 1];
                if (first) {
                    parent = first.parentNode;
                    parent.insertBefore(start, first);
                    if (parent.lastChild === last) {
                        parent.appendChild(end);
                    } else {
                        parent.insertBefore(end, last.nextSibling);
                    }
                } else {
                    parent = document.createElement("div");
                    parent.appendChild(start);
                    parent.appendChild(end);
                }
                return this._sections[bid] = new Section(bid, start, this);
            };
            Pilot.prototype._register = function(bid, block) {
                this._sections[bid] = block;
                this.update();
                return block;
            };
            Pilot.prototype.update = function(element) {
                var child, controllerName, _i, _len, _ref, _results;
                if (element == null) {
                    element = document.body;
                }
                if (controllerName = this._controllerNameFromBlock(element)) {
                    if (this._sections[controllerName]) {
                        this._sections[controllerName].reset(element);
                    } else {
                        this._sections[controllerName] = new Section(controllerName, element, this);
                    }
                    this._bindController(controllerName);
                    return;
                }
                if (element.childNodes) {
                    _ref = element.childNodes;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        _results.push(this.update(child));
                    }
                    return _results;
                }
            };
            Pilot.prototype._isStartBlock = function(element) {
                return element && element.nodeName === "#comment" && String(element.nodeValue).substr(0, 4) === "spc:";
            };
            Pilot.prototype._controllerNameFromBlock = function(element) {
                if (this._isStartBlock(element)) {
                    return element.nodeValue.substr(4);
                } else {
                    return null;
                }
            };
            Pilot.prototype._bindController = function(name) {
                var block, controller;
                if (!(block = this._sections[name]) || !(controller = this._controllers[name]) || block.controller() === controller) {
                    return;
                }
                block.controller(controller);
                return controller.elementBlock(block);
            };
            Pilot.prototype._generateRandomBlockId = function() {
                var bid;
                while (1) {
                    bid = "block-" + ++this._bid;
                    if (!this._sections[bid]) {
                        break;
                    }
                }
                return bid;
            };
            return Pilot;
        }();
        module.exports = new Pilot;
        module.exports.create = function() {
            return new Pilot;
        };
        module.exports.utils = require("pilot-block/lib/utils.js");
        return module.exports;
    });
    define("asyngleton/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var EventEmitter = require("events/index.js").EventEmitter;
        var singletonIndex = 0;
        function singleton(resetEachCall, fn) {
            if (arguments.length == 1) {
                fn = resetEachCall;
                resetEachCall = false;
            }
            var _id = singletonIndex++;
            var asyngleton = function() {
                var asyng = asyngleton.info.call(this), self = this;
                var args, cb, callback = arguments[arguments.length - 1];
                if (!(typeof callback == "function")) {
                    callback = function() {};
                }
                if (asyng.result) {
                    callback.apply(this, asyng.result);
                    return this;
                }
                asyng.em.once("singleton", callback);
                if (asyng.loading) {
                    return this;
                }
                asyng.loading = true;
                args = Array.prototype.slice.call(arguments, 0);
                cb = function() {
                    var result = asyng.result = Array.prototype.slice.call(arguments, 0);
                    if (resetEachCall) {
                        asyngleton.reset.call(self);
                    }
                    asyng.em.emit.apply(asyng.em, [ "singleton" ].concat(result));
                };
                args.pop();
                args.push(cb);
                fn.apply(this, args);
                return this;
            };
            asyngleton.reset = function() {
                var asyng = asyngleton.info.call(this);
                asyng.loading = false;
                asyng.result = undefined;
                return asyngleton;
            };
            asyngleton.info = function() {
                if (!this._asyngleton) {
                    this._asyngleton = {};
                }
                var asyng;
                if (!(asyng = this._asyngleton[_id])) {
                    asyng = this._asyngleton[_id] = {
                        result: null,
                        loading: false,
                        em: new EventEmitter
                    };
                }
                return asyng;
            };
            return asyngleton;
        }
        function createDictionary() {
            var _dict = {};
            return {
                get: function(key, fn) {
                    if (_dict[key]) return _dict[key];
                    var asyngleton = _dict[key] = singleton(fn);
                    asyngleton.dispose = function() {
                        delete _dict[key];
                    };
                    return asyngleton;
                }
            };
        }
        function structrFactory(that, property, value) {
            return singleton(value);
        }
        module.exports = singleton;
        module.exports.dictionary = createDictionary;
        module.exports.type = "operator";
        module.exports.factory = structrFactory;
        return module.exports;
    });
    define("paperclip/lib/paper/defaultModifiers.js", function(require, module, exports, __dirname, __filename) {
        module.exports = {
            uppercase: function(value) {
                return String(value).toUpperCase();
            },
            lowercase: function(value) {
                return String(value).toLowerCase();
            },
            json: function(value, count, delimiter) {
                return JSON.stringify.apply(JSON, arguments);
            }
        };
        return module.exports;
    });
    define("bindable/lib/object/binding.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableSetter, Binding, bindableSetter, deepPropertyWatcher, toarray, utils;
            BindableSetter = require("bindable/lib/object/setters/factory.js");
            bindableSetter = new BindableSetter;
            utils = require("bindable/lib/core/utils.js");
            toarray = require("toarray/index.js");
            deepPropertyWatcher = require("bindable/lib/object/deepPropertyWatcher.js");
            module.exports = Binding = function() {
                Binding.prototype.__isBinding = true;
                function Binding(_from, _property) {
                    this._from = _from;
                    this._property = _property;
                    this._limit = -1;
                    this._setters = [];
                    this._triggerCount = 0;
                    this._listen();
                }
                Binding.prototype.now = function() {
                    var setter, value, _i, _len, _ref;
                    value = this._from.get(this._property);
                    if (this._value === value) {
                        return this;
                    }
                    _ref = this._setters;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        setter.change(value);
                    }
                    if (~this._limit && ++this._triggerCount > this._limit) {
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
                    return from.bind(property).to(this._from, this._property);
                };
                Binding.prototype.transform = function(options) {
                    if (!arguments.length) {
                        return this._transform;
                    }
                    this._transform = utils.transformer(options);
                    return this;
                };
                Binding.prototype._transformer = function() {
                    return this._transform || (this._transform = utils.transformer(options));
                };
                Binding.prototype.once = function() {
                    return this.limit(0);
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
                    if (this._listener) {
                        this._listener.dispose();
                        this._disposeListener.dispose();
                    }
                    this._listener = void 0;
                    this._disposeListener = void 0;
                    return this;
                };
                Binding.prototype._listen = function() {
                    var _this = this;
                    this._listener = deepPropertyWatcher.create({
                        target: this._from,
                        property: this._property,
                        callback: function() {
                            return _this.now();
                        }
                    });
                    return this._disposeListener = this._from.once("dispose", function() {
                        return _this.dispose();
                    });
                };
                return Binding;
            }();
            Binding.fromOptions = function(target, options) {
                var binding, t, to, tops, _i, _len;
                binding = target.bind(options.property || options.from);
                to = toarray(options.to);
                for (_i = 0, _len = to.length; _i < _len; _i++) {
                    t = to[_i];
                    tops = typeof t === "object" ? t.property : {
                        property: t
                    };
                    if (tops.transform) {
                        bindings.transform(tops.transform);
                    }
                    binding.to(tops.property);
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
            require("dref/lib/index.js").use(require("bindable/lib/shim/dref.js"));
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
                Bindable.prototype.get = function(key, flatten) {
                    var _ref;
                    if (flatten == null) {
                        flatten = false;
                    }
                    return (_ref = dref.get(this.data, key, flatten)) != null ? _ref : dref.get(this[key.split(".").shift()], key.split(".").slice(1).join("."), flatten);
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
                    if (value && value.__isBinding) {
                        value.to(this, key);
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
                    return this;
                };
                Bindable.prototype._ref = function(context, key) {
                    if (!key) {
                        return context;
                    }
                    return dref.get(context, key);
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
            var BindableObject, Binding, EventEmitter, dref, hoist, type, __bind = function(fn, me) {
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
                    this.__enforceId = true;
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
                        this._sourceBinding = source.bind().to(this);
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
                        if (dref.get(item, this.__id) === dref.get(searchItem, this.__id)) {
                            return i;
                        }
                    }
                    return -1;
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
                    _id = dref.get(item, this.__id);
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
            var EventEmitter, disposable, events, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
    define("paperclip/lib/paper/nodes/nodeBinding.js", function(require, module, exports, __dirname, __filename) {
        var AttributeBinding, Base, ClippedBuffer, NodeBinding, async, attrFactory, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        }, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        };
        async = require("async/lib/async.js");
        ClippedBuffer = require("paperclip/lib/clip/buffer.js");
        Base = require("paperclip/lib/paper/nodes/base.js");
        attrFactory = require("paperclip/lib/paper/decor/attrFactory.js");
        AttributeBinding = function(_super) {
            __extends(AttributeBinding, _super);
            function AttributeBinding(name, buffer) {
                this.name = name;
                AttributeBinding.__super__.constructor.call(this);
                this.clippedBuffer = new ClippedBuffer(buffer);
            }
            AttributeBinding.prototype.load = function(info) {
                this.clippedBuffer.reset(info.data);
                if (this.clippedBuffer.text.length) {
                    return info.buffer.push(" " + this.name + '="' + this.clippedBuffer.text + '"');
                }
            };
            return AttributeBinding;
        }(Base);
        NodeBinding = function(_super) {
            __extends(NodeBinding, _super);
            NodeBinding.prototype.name = "nodeBinding";
            function NodeBinding(name, options) {
                this.name = name;
                this.options = options != null ? options : {};
                this.bind = __bind(this.bind, this);
                NodeBinding.__super__.constructor.call(this);
                this.attributes = options.attrs || {};
                this._decor = attrFactory.getDecor(this);
                if (options.children) {
                    this.addChild(options.children);
                }
            }
            NodeBinding.prototype.bind = function() {
                NodeBinding.__super__.bind.call(this);
                this._decor.bind();
                return this;
            };
            NodeBinding.prototype._writeHead = function(context) {
                this._writeStartBlock(context);
                return context.buffer.push("<" + this.name);
            };
            NodeBinding.prototype._loadChildren = function(context) {
                this._decor.load(context);
                context.buffer.push(">");
                return NodeBinding.__super__._loadChildren.call(this, context);
            };
            NodeBinding.prototype._writeTail = function(context) {
                context.buffer.push("</" + this.name + ">");
                return this._writeEndBlock(context);
            };
            NodeBinding.prototype.clone = function() {
                return new NodeBinding(this.name, this.options);
            };
            return NodeBinding;
        }(require("paperclip/lib/paper/nodes/bindable.js"));
        module.exports = NodeBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/nodes/blockBinding.js", function(require, module, exports, __dirname, __filename) {
        var Base, BlockBinding, BlockChild, Clip, decorFactory, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        Base = require("paperclip/lib/paper/nodes/base.js");
        decorFactory = require("paperclip/lib/paper/decor/blockFactory.js");
        Clip = require("paperclip/lib/clip/index.js");
        BlockChild = function(_super) {
            __extends(BlockChild, _super);
            function BlockChild(block, _with) {
                this.block = block;
                this["with"] = _with;
                BlockChild.__super__.constructor.call(this);
                this.content = this.block.contentFactory();
            }
            BlockChild.prototype.bind = function() {
                BlockChild.__super__.bind.call(this);
                this.content.bind();
                return this;
            };
            BlockChild.prototype.dispose = function() {
                BlockChild.__super__.dispose.call(this);
                this.content.dispose();
                return this;
            };
            BlockChild.prototype.load = function(context) {
                if (!this["with"]) {
                    return BlockChild.__super__.load.call(this, context);
                }
                return BlockChild.__super__.load.call(this, context.child(this["with"]));
            };
            BlockChild.prototype._loadChildren = function(context) {
                return this.content.load(context);
            };
            return BlockChild;
        }(require("paperclip/lib/paper/nodes/bindable.js"));
        BlockBinding = function(_super) {
            __extends(BlockBinding, _super);
            BlockBinding.prototype.name = "blockBinding";
            function BlockBinding(script, contentFactory, childBinding) {
                this.script = script;
                this.contentFactory = contentFactory;
                this.childBinding = childBinding;
                BlockBinding.__super__.constructor.call(this);
                this.clip = new Clip({
                    script: script,
                    watch: false
                });
                this._decor = decorFactory.getDecor(this);
            }
            BlockBinding.prototype.bind = function() {
                BlockBinding.__super__.bind.call(this);
                this.clip.watch();
                return this._decor.bind();
            };
            BlockBinding.prototype.dispose = function() {
                this.clip.dispose();
                this._decor.dispose();
                return BlockBinding.__super__.dispose.call(this);
            };
            BlockBinding.prototype.createContent = function(wth) {
                return new BlockChild(this, wth);
            };
            BlockBinding.prototype._writeHead = function(context) {
                this.clip.reset(context);
                this.clip.update();
                return BlockBinding.__super__._writeHead.call(this, context);
            };
            BlockBinding.prototype._loadChildren = function(context) {
                return this._decor.load(context);
            };
            BlockBinding.prototype.clone = function() {
                return new BlockBinding(this.script, Base.cloneEach(this.children));
            };
            return BlockBinding;
        }(require("paperclip/lib/paper/nodes/bindable.js"));
        module.exports = BlockBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/nodes/string.js", function(require, module, exports, __dirname, __filename) {
        var StringBuilder, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        StringBuilder = function(_super) {
            __extends(StringBuilder, _super);
            StringBuilder.prototype.name = "string";
            function StringBuilder(buffer) {
                if (buffer == null) {
                    buffer = "";
                }
                this._buffer = buffer;
                StringBuilder.__super__.constructor.call(this);
            }
            StringBuilder.prototype._writeHead = function(info) {
                info.buffer.push(this._buffer);
                return StringBuilder.__super__._writeHead.call(this, info);
            };
            StringBuilder.prototype.clone = function() {
                return new StringBuilder(this._buffer);
            };
            return StringBuilder;
        }(require("paperclip/lib/paper/nodes/base.js"));
        module.exports = StringBuilder;
        return module.exports;
    });
    define("paperclip/lib/paper/nodes/base.js", function(require, module, exports, __dirname, __filename) {
        var Base, async, pilot;
        async = require("async/lib/async.js");
        pilot = require("pilot-block/lib/index.js");
        Base = function() {
            Base.prototype.__isNode = true;
            function Base() {
                this.children = [];
            }
            Base.prototype.bind = function() {
                var child, _i, _len, _ref;
                _ref = this.children || [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    child.bind();
                }
                return this;
            };
            Base.prototype.dispose = function() {
                var child, _i, _len, _ref, _ref1, _results;
                if ((_ref = this.section) != null) {
                    _ref.dispose();
                }
                _ref1 = this.children || [];
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    child = _ref1[_i];
                    _results.push(child.dispose());
                }
                return _results;
            };
            Base.prototype.attach = function(element, context) {
                this.load(context.detachBuffer());
                if (element.__isNode) {
                    element.section.append(pilot.createSection(context.buffer.join("")));
                    pilot.update(element.section.parent);
                } else {
                    element.innerHTML = context.buffer.join("");
                    pilot.update(element);
                }
                return this.bind();
            };
            Base.prototype.load = function(context) {
                this.context = context;
                this._writeHead(context);
                this._loadChildren(context);
                this._writeTail(context);
                return this;
            };
            Base.prototype._writeHead = function(info) {};
            Base.prototype._loadChildren = function(context) {
                var child, _i, _len, _ref, _results;
                _ref = this.children;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    _results.push(child.load(context));
                }
                return _results;
            };
            Base.prototype._writeTail = function(info) {};
            Base.prototype.addChild = function() {
                var child, _i, _len, _results;
                _results = [];
                for (_i = 0, _len = arguments.length; _i < _len; _i++) {
                    child = arguments[_i];
                    child.parent = this;
                    _results.push(this.children.push(child));
                }
                return _results;
            };
            Base.cloneEach = function(source) {
                var item, items, _i, _len;
                items = [];
                for (_i = 0, _len = source.length; _i < _len; _i++) {
                    item = source[_i];
                    items.push(item.clone());
                }
                return items;
            };
            return Base;
        }();
        module.exports = Base;
        return module.exports;
    });
    define("pilot-block/lib/section.js", function(require, module, exports, __dirname, __filename) {
        var Section, utils;
        utils = require("pilot-block/lib/utils.js");
        Section = function() {
            Section.prototype.__isSection = true;
            function Section(name, start, pilot) {
                this.name = name;
                this.start = start;
                this.pilot = pilot;
                if (!start.parentNode || (start != null ? start.parentNode.nodeType : void 0) === 11) {
                    utils.copySiblings(this.start, document.createElement("div"));
                }
                this.update();
            }
            Section.prototype.removeElements = function() {
                this.detach();
                this.elements = [];
                return this.allElements = [];
            };
            Section.prototype.reset = function(start) {
                if (this.start === start) {
                    return;
                }
                this.start = start;
                return this.update();
            };
            Section.prototype.removeAll = function() {
                var _ref, _ref1;
                this.pilot._removeSection(this);
                this.removeElements();
                if ((_ref = this.start.parentNode) != null) {
                    _ref.removeChild(this.start);
                }
                return (_ref1 = this.end.parentNode) != null ? _ref1.removeChild(this.end) : void 0;
            };
            Section.prototype.appendTo = function(element) {
                return utils.moveChildren(utils.arrayToFragment(this.allElements), element);
            };
            Section.prototype.append = function() {
                utils.insertAfter(this._parseElements(arguments), this.end.previousSibling);
                this.unguard();
                return this.update();
            };
            Section.prototype.prepend = function() {
                utils.insertAfter(this._parseElements(arguments), this.start);
                this.unguard();
                return this.update();
            };
            Section.prototype.unguard = function() {
                return utils.unguardComments(this.start.parentNode);
            };
            Section.prototype.replaceChildren = function(element) {
                utils.removeAllChildren(element);
                return this.appendTo(element);
            };
            Section.prototype.html = function(content) {
                if (!arguments.length) {
                    return this.toString();
                }
                this.update();
                this.removeElements();
                return this.prepend(utils.createElements(content));
            };
            Section.prototype.toString = function() {
                return utils.guardComments($(this.start.parentNode).html());
            };
            Section.prototype.updateChildren = function() {
                return this.pilot.update(this.start.parentNode);
            };
            Section.prototype.controller = function(value) {
                if (!arguments.length) {
                    return this._controller;
                }
                return this._controller = value;
            };
            Section.prototype.dispose = function() {
                return this.removeAll();
            };
            Section.prototype.update = function() {
                var celement, elements, endElement, nid;
                celement = this.start.nextSibling;
                nid = "epc:" + this.name;
                elements = [];
                while (celement) {
                    if (celement.nodeName === "#comment" && String(celement.nodeValue) === nid) {
                        endElement = celement;
                        break;
                    }
                    elements.push(celement);
                    celement = celement.nextSibling;
                }
                this.elements = elements;
                this.end = endElement;
                return this.allElements = [ this.start ].concat(elements).concat([ this.end ]);
            };
            Section.prototype.attachedToDOM = function() {
                var p;
                p = this.start;
                while (p && p !== document.body) {
                    p = p.parentNode;
                }
                return p === document.body;
            };
            Section.prototype.detach = function() {
                var celement, celements, parent;
                this._detached = true;
                celements = [];
                celement = this.start.nextSibling;
                parent = this.start.parentNode;
                if (!parent) {
                    return;
                }
                while (celement && celement !== this.end) {
                    celements.push(celement);
                    parent.removeChild(celement);
                    celement = this.start.nextSibling;
                }
                this.detachedElements = celements;
                return this.update();
            };
            Section.prototype.dispose = function() {
                return this.removeAll();
            };
            Section.prototype.attach = function() {
                var element, frag, _i, _len, _ref;
                if (!this._detached) {
                    return;
                }
                frag = document.createDocumentFragment();
                _ref = this.detachedElements;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    element = _ref[_i];
                    frag.appendChild(element);
                }
                this.start.parentNode.insertBefore(frag, this.end);
                return this.update();
            };
            Section.prototype._parseElement = function(element) {
                if (typeof element === "string") {
                    return utils.createElements(element).childNodes;
                } else if (element.__isSection) {
                    return utils.arrayToFragment(element.allElements);
                } else {
                    return element;
                }
            };
            Section.prototype._parseElements = function(elements) {
                var el, frag, _i, _len;
                frag = document.createDocumentFragment();
                for (_i = 0, _len = elements.length; _i < _len; _i++) {
                    el = elements[_i];
                    frag.appendChild(this._parseElement(el));
                }
                return frag;
            };
            return Section;
        }();
        module.exports = Section;
        return module.exports;
    });
    define("toarray/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = function(item) {
            if (item === undefined) return [];
            return Object.prototype.toString.call(item) === "[object Array]" ? item : [ item ];
        };
        return module.exports;
    });
    define("pilot-block/lib/utils.js", function(require, module, exports, __dirname, __filename) {
        exports.moveChildren = function(from, after) {
            return after.appendChild(exports.fragment(from));
        };
        exports.copySiblings = function(child, to) {
            var sibling, siblings, _i, _len;
            siblings = [];
            while (child) {
                siblings.push(child);
                child = child.nextSibling;
            }
            for (_i = 0, _len = siblings.length; _i < _len; _i++) {
                sibling = siblings[_i];
                to.appendChild(sibling);
            }
            return to;
        };
        exports.fragment = function(from) {
            var frag;
            frag = document.createDocumentFragment();
            while (from.childNodes.length) {
                frag.appendChild(from.childNodes[0]);
            }
            return frag;
        };
        exports.copyElements = function(elements) {
            var child, frag, _i, _len;
            frag = document.createDocumentFragment();
            for (_i = 0, _len = elements.length; _i < _len; _i++) {
                child = elements[_i];
                if (!child) {
                    continue;
                }
                frag.appendChild(child.cloneNode(true));
            }
            return frag;
        };
        exports.insertAfter = function(element, after) {
            var parent;
            parent = after.parentNode;
            if (after === parent.lastChild) {
                return parent.appendChild(element);
            } else {
                return parent.insertBefore(element, after.nextSibling);
            }
        };
        exports.createElements = function(content) {
            var doc, frag;
            frag = document.createDocumentFragment();
            doc = document.createElement("div");
            $(doc).html(exports.guardComments(content));
            while (doc.childNodes.length) {
                frag.appendChild(doc.childNodes[0]);
            }
            return frag;
        };
        exports.arrayToFragment = function(children) {
            var child, frag, _i, _len;
            frag = document.createDocumentFragment();
            for (_i = 0, _len = children.length; _i < _len; _i++) {
                child = children[_i];
                frag.appendChild(child);
            }
            return frag;
        };
        exports.guardComments = function(content) {
            return String(content || "").replace(/(\{g\})*<!--/g, "{g}<!--");
        };
        exports.unguardComments = function(element) {
            var child, _i, _len, _ref;
            _ref = element.childNodes;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                exports.unguardComments(child);
            }
            if (element.nodeName === "#text") {
                if (~element.nodeValue.indexOf("{g}")) {
                    return element.nodeValue = element.nodeValue.replace(/\{g\}/g, "");
                }
            }
        };
        exports.removeAllChildren = function(element) {
            var _results;
            _results = [];
            while (element.childNodes.length) {
                _results.push(element.removeChild(element.childNodes[0]));
            }
            return _results;
        };
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
                    return value;
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
                return {
                    from: hoist.map(options.from),
                    to: hoist.map(options.to)
                };
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/deepPropertyWatcher.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var PropertyWatcher, dref, poolParty, propertyWatcher, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            dref = require("dref/lib/index.js");
            poolParty = require("poolparty/lib/index.js");
            PropertyWatcher = function() {
                function PropertyWatcher(options) {
                    this._changed = __bind(this._changed, this);
                    this.reset(options);
                }
                PropertyWatcher.prototype.reset = function(options) {
                    if (options.property) {
                        options.path = options.property.split(".");
                    }
                    this.index = options.index || 0;
                    this._fullPath = options.path;
                    this._path = this._fullPath.slice(0, this.index);
                    this._property = this._path.join(".");
                    this.target = options.target;
                    this.callback = options.callback;
                    return this._watch();
                };
                PropertyWatcher.prototype._dispose = function() {
                    if (this._listener) {
                        this._listener.dispose();
                        this._listener = void 0;
                    }
                    if (this._binding) {
                        this._binding.dispose();
                        this._binding = void 0;
                    }
                    if (this._child) {
                        this._child.dispose();
                        return this._child = void 0;
                    }
                };
                PropertyWatcher.prototype.dispose = function() {
                    this._dispose();
                    return propertyWatcher.add(this);
                };
                PropertyWatcher.prototype._watch = function() {
                    var value;
                    value = this.target.get(this._property);
                    if (this._property.length) {
                        this._listener = this.target.on("change:" + this._property, this._changed);
                    }
                    if (value && value.__isBindable) {
                        return this._binding = propertyWatcher.create({
                            target: value,
                            path: this._fullPath.slice(this.index),
                            callback: this._changed
                        });
                    } else if (this._path.length < this._fullPath.length) {
                        return this._child = propertyWatcher.create({
                            target: this.target,
                            path: this._fullPath,
                            callback: this.callback,
                            index: this.index + 1
                        });
                    }
                };
                PropertyWatcher.prototype._changed = function(value) {
                    this._dispose();
                    this._watch();
                    return this.callback(value);
                };
                return PropertyWatcher;
            }();
            propertyWatcher = module.exports = poolParty({
                max: 100,
                factory: function(options) {
                    return new PropertyWatcher(options);
                },
                recycle: function(watcher, options) {
                    return watcher.reset(options);
                }
            });
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
                    return;
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
    define("bindable/lib/shim/dref.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            module.exports = {
                test: function(item) {
                    return item.get && item.set;
                },
                get: function(item, key) {
                    var result;
                    result = item.data[key];
                    if (result === null || result === void 0) {
                        result = item[key];
                    }
                    return result;
                },
                set: function(item, key, value) {
                    return item.set(key, value);
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
                }
                _Class.prototype.transform = function(value) {
                    if (!arguments.length) {
                        return this._transformer;
                    }
                    this._transformer = utils.transformer(value);
                    return this;
                };
                _Class.prototype.now = function() {
                    var setter, _i, _len, _ref;
                    _ref = this._setters;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        setter.now();
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
                    async.setImmediate = setImmediate;
                    async.nextTick = setImmediate;
                } else {
                    async.setImmediate = async.nextTick;
                    async.nextTick = function(fn) {
                        setTimeout(fn, 0);
                    };
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
                return String(this.value || "");
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
                return this.update();
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
    define("paperclip/lib/paper/decor/attrFactory.js", function(require, module, exports, __dirname, __filename) {
        var Clip, ClippedBuffer, Collection, DataBindDecor, Factory, TextAttrBinding, attrDecorators;
        Collection = require("paperclip/lib/paper/decor/collection.js");
        ClippedBuffer = require("paperclip/lib/clip/buffer.js");
        Clip = require("paperclip/lib/clip/index.js");
        attrDecorators = {
            css: require("paperclip/lib/paper/decor/attr/css.js"),
            show: require("paperclip/lib/paper/decor/attr/show.js"),
            style: require("paperclip/lib/paper/decor/attr/style.js"),
            value: require("paperclip/lib/paper/decor/attr/value.js"),
            click: require("paperclip/lib/paper/decor/attr/event.js"),
            submit: require("paperclip/lib/paper/decor/attr/event.js"),
            mousedown: require("paperclip/lib/paper/decor/attr/event.js"),
            mouseup: require("paperclip/lib/paper/decor/attr/event.js"),
            mouseover: require("paperclip/lib/paper/decor/attr/event.js"),
            mouseout: require("paperclip/lib/paper/decor/attr/event.js"),
            keydown: require("paperclip/lib/paper/decor/attr/event.js"),
            keyup: require("paperclip/lib/paper/decor/attr/event.js"),
            enter: require("paperclip/lib/paper/decor/attr/enter.js"),
            disable: require("paperclip/lib/paper/decor/attr/disable.js"),
            checked: require("paperclip/lib/paper/decor/attr/checked.js")
        };
        DataBindDecor = require("paperclip/lib/paper/decor/attr/dataBind.js");
        TextAttrBinding = require("paperclip/lib/paper/decor/attr/text.js");
        Factory = function() {
            function Factory() {}
            Factory.prototype.getDecor = function(node) {
                var ad, attribute, clip, decor, name, _i, _len, _ref;
                decor = new Collection;
                if (node.attributes["data-bind"]) {
                    decor.clip = clip = new Clip({
                        script: node.attributes["data-bind"][0],
                        watch: false
                    });
                    _ref = clip.scripts.names;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        name = _ref[_i];
                        if (ad = attrDecorators[name.toLowerCase()]) {
                            decor.push(new ad(node, name.toLowerCase(), clip));
                        } else {
                            decor.push(new DataBindDecor(node, name, clip));
                        }
                    }
                }
                for (attribute in node.attributes) {
                    decor.push(new TextAttrBinding(node, attribute, new ClippedBuffer(node.attributes[attribute])));
                }
                return decor;
            };
            return Factory;
        }();
        module.exports = new Factory;
        return module.exports;
    });
    define("paperclip/lib/paper/nodes/bindable.js", function(require, module, exports, __dirname, __filename) {
        var BindableNode, pilot, _pcid, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        pilot = require("pilot-block/lib/index.js");
        _pcid = 0;
        BindableNode = function(_super) {
            __extends(BindableNode, _super);
            function BindableNode() {
                _ref = BindableNode.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            BindableNode.prototype.bind = function() {
                BindableNode.__super__.bind.call(this);
                this.section = pilot.section(this.id);
                return this;
            };
            BindableNode.prototype._writeHead = function(context) {
                this._writeStartBlock(context);
                return BindableNode.__super__._writeHead.call(this, context);
            };
            BindableNode.prototype._writeStartBlock = function(context) {
                return context.buffer.push("<!--spc:" + (this.id = ++_pcid) + "-->");
            };
            BindableNode.prototype._writeTail = function(context) {
                this._writeEndBlock(context);
                return BindableNode.__super__._writeTail.call(this, context);
            };
            BindableNode.prototype._writeEndBlock = function(context) {
                return context.buffer.push("<!--epc:" + this.id + "-->");
            };
            return BindableNode;
        }(require("paperclip/lib/paper/nodes/base.js"));
        module.exports = BindableNode;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/blockFactory.js", function(require, module, exports, __dirname, __filename) {
        var DecorCollection, Factory, blockDecorators;
        DecorCollection = require("paperclip/lib/paper/decor/collection.js");
        blockDecorators = {
            html: require("paperclip/lib/paper/decor/block/html.js"),
            when: require("paperclip/lib/paper/decor/block/when.js"),
            "with": require("paperclip/lib/paper/decor/block/with.js"),
            each: require("paperclip/lib/paper/decor/block/each.js"),
            value: require("paperclip/lib/paper/decor/block/value.js"),
            block: require("paperclip/lib/paper/decor/block/block.js"),
            template: require("paperclip/lib/paper/decor/block/template.js"),
            view: require("paperclip/lib/paper/decor/block/view.js")
        };
        Factory = function() {
            function Factory() {}
            Factory.prototype.getDecor = function(node) {
                var bd, decor, scriptName, _i, _len, _ref;
                decor = new DecorCollection;
                _ref = node.clip.scripts.names;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    scriptName = _ref[_i];
                    if (bd = blockDecorators[scriptName]) {
                        decor.push(new bd(node, scriptName));
                    }
                }
                return decor;
            };
            return Factory;
        }();
        module.exports = new Factory;
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
                _Class.prototype._change = function(value) {
                    return this.callback(value);
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
                _Class.prototype._change = function(value) {
                    return this.to.set(this.property, value);
                };
                _Class.prototype.dispose = function() {
                    var _ref;
                    if ((_ref = this._bothWaysBinding) != null) {
                        _ref.dispose();
                    }
                    return this._bothWaysBinding = this.binding = this.to = this.property = null;
                };
                _Class.prototype.bothWays = function() {
                    var _this = this;
                    return this._bothWaysBinding = this.to.bind(this.property).to(function(value) {
                        if (_this._value === value) {
                            return;
                        }
                        return _this._changeFrom(value);
                    });
                };
                _Class.prototype._changeFrom = function(value) {
                    return this.binding._from.set(this.binding._property, this._value = this.__transform("from", value));
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
                _Class.prototype._change = function(value) {
                    return this.to.reset(value);
                };
                _Class.prototype.dispose = function() {
                    return this.to.disposeSourceBinding();
                };
                return _Class;
            }(Base);
        }).call(this);
        return module.exports;
    });
    define("poolparty/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var PoolParty, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            PoolParty = function() {
                function PoolParty(options) {
                    if (options == null) {
                        options = {};
                    }
                    this.drip = __bind(this.drip, this);
                    this.max = options.max || 50;
                    this.min = options.min || 0;
                    this.staleTimeout = options.staleTimeout || 1e3;
                    this.factory = options.factory || options.create;
                    this.recycle = options.recycle;
                    this._pool = [];
                    this._size = 0;
                }
                PoolParty.prototype.size = function() {
                    return this._size;
                };
                PoolParty.prototype.drain = function() {
                    var i, _i, _ref, _results;
                    _results = [];
                    for (i = _i = 0, _ref = this._size - this.min; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                        _results.push(this.drip());
                    }
                    return _results;
                };
                PoolParty.prototype.drip = function() {
                    this._dripping = false;
                    if (!this._size) {
                        return;
                    }
                    this._size--;
                    this._pool.shift();
                    return this._timeoutDrip();
                };
                PoolParty.prototype.create = function(options) {
                    var item;
                    if (this._size) {
                        this._size--;
                        item = this._pool.shift();
                        this.recycle(item, options);
                        return item;
                    }
                    item = this.factory(options);
                    item.__pool = this;
                    return item;
                };
                PoolParty.prototype.add = function(object) {
                    if (object.__pool !== this) {
                        return this;
                    }
                    if (!~this._pool.indexOf(object) && this._size < this.max) {
                        this._size++;
                        this._pool.push(object);
                        this._timeoutDrip();
                    }
                    return this;
                };
                PoolParty.prototype._timeoutDrip = function() {
                    if (this._dripping) {
                        return;
                    }
                    this._dripping = true;
                    return setTimeout(this.drip, this.staleTimeout);
                };
                return PoolParty;
            }();
            module.exports = function(options) {
                return new PoolParty(options);
            };
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
    define("paperclip/lib/paper/decor/collection.js", function(require, module, exports, __dirname, __filename) {
        var Collection, async;
        async = require("async/lib/async.js");
        Collection = function() {
            function Collection() {
                this._models = [];
            }
            Collection.prototype.push = function(model) {
                return this._models.push(model);
            };
            Collection.prototype.dispose = function() {
                var model, _i, _len, _ref, _ref1, _results;
                if ((_ref = this.clip) != null) {
                    _ref.dispose();
                }
                _ref1 = this._models;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    model = _ref1[_i];
                    _results.push(model.dispose());
                }
                return _results;
            };
            Collection.prototype.load = function(context) {
                var decor, _i, _len, _ref, _ref1, _results;
                if ((_ref = this.clip) != null) {
                    _ref.reset(context, false);
                }
                _ref1 = this._models;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    decor = _ref1[_i];
                    _results.push(decor.load(context));
                }
                return _results;
            };
            Collection.prototype.bind = function() {
                var decor, _i, _len, _ref, _results;
                if (this._bound) {
                    return;
                }
                this._bound = true;
                _ref = this._models;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    decor = _ref[_i];
                    _results.push(decor.bind());
                }
                return _results;
            };
            return Collection;
        }();
        module.exports = Collection;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/css.js", function(require, module, exports, __dirname, __filename) {
        var CssDecor, _ref, __bind = function(fn, me) {
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
        CssDecor = function(_super) {
            __extends(CssDecor, _super);
            function CssDecor() {
                this._updateCss = __bind(this._updateCss, this);
                _ref = CssDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            CssDecor.prototype.bind = function() {
                CssDecor.__super__.bind.call(this);
                this._currentClasses = {};
                this.$element = $(this.element);
                return this.clip.bind("css").to(this._updateCss).now();
            };
            CssDecor.prototype._updateCss = function(classes) {
                var className, useClass, _results;
                _results = [];
                for (className in classes) {
                    useClass = classes[className];
                    if (useClass) {
                        if (!this._currentClasses[className]) {
                            this._currentClasses[className] = 1;
                            _results.push(this.$element.addClass(className));
                        } else {
                            _results.push(void 0);
                        }
                    } else {
                        if (this._currentClasses[className]) {
                            delete this._currentClasses[className];
                            _results.push(this.$element.removeClass(className));
                        } else {
                            _results.push(void 0);
                        }
                    }
                }
                return _results;
            };
            return CssDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = CssDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/show.js", function(require, module, exports, __dirname, __filename) {
        var ShowDecor, _ref, __bind = function(fn, me) {
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
        ShowDecor = function(_super) {
            __extends(ShowDecor, _super);
            function ShowDecor() {
                this._show = __bind(this._show, this);
                _ref = ShowDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ShowDecor.prototype.bind = function() {
                ShowDecor.__super__.bind.call(this);
                this.$element = $(this.element);
                this.clip.bind("show").to(this._show).now();
                return this._show(this.clip.get("show"));
            };
            ShowDecor.prototype._show = function(value) {
                return this.$element.css({
                    display: value ? "block" : "none"
                });
            };
            return ShowDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = ShowDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/style.js", function(require, module, exports, __dirname, __filename) {
        var StyleDecor, _ref, __bind = function(fn, me) {
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
        StyleDecor = function(_super) {
            __extends(StyleDecor, _super);
            function StyleDecor() {
                this._updateStyle = __bind(this._updateStyle, this);
                _ref = StyleDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            StyleDecor.prototype.bind = function() {
                StyleDecor.__super__.bind.call(this);
                this._currentStyles = {};
                this.$element = $(this.element);
                return this.clip.bind("style").to(this._updateStyle).now();
            };
            StyleDecor.prototype._updateStyle = function(styles) {
                var hasNew, name, newStyles, style;
                newStyles = {};
                hasNew = false;
                for (name in styles) {
                    style = styles[name];
                    if (style !== this._currentStyles[name]) {
                        newStyles[name] = this._currentStyles[name] = style;
                        hasNew = true;
                    }
                }
                if (hasNew) {
                    return this.$element.css(newStyles);
                }
            };
            return StyleDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = StyleDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/value.js", function(require, module, exports, __dirname, __filename) {
        var ValueDecor, _, _ref, __bind = function(fn, me) {
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
        ValueDecor = function(_super) {
            __extends(ValueDecor, _super);
            function ValueDecor() {
                this._onChange = __bind(this._onChange, this);
                this._onElementChange = __bind(this._onElementChange, this);
                _ref = ValueDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ValueDecor.prototype.bind = function() {
                ValueDecor.__super__.bind.call(this);
                $(this.element).bind("keydown change input", _.debounce(this._onElementChange, 1));
                return this._onChange(this.clip.get("value"));
            };
            ValueDecor.prototype._onElementChange = function(event) {
                var _this = this;
                return setTimeout(function() {
                    var ref, value, _i, _len, _ref1, _results;
                    value = _this.element.value;
                    if (_this.clip.get("bothWays")) {
                        _ref1 = _this.refs;
                        _results = [];
                        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                            ref = _ref1[_i];
                            _results.push(_this.context.set(ref, value));
                        }
                        return _results;
                    }
                }, 5);
            };
            ValueDecor.prototype._onChange = function(value) {
                return this.element.value = this.currentValue = value;
            };
            return ValueDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = ValueDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/event.js", function(require, module, exports, __dirname, __filename) {
        var SubmitDecor, _ref, __bind = function(fn, me) {
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
        SubmitDecor = function(_super) {
            __extends(SubmitDecor, _super);
            function SubmitDecor() {
                this._onSubmitted = __bind(this._onSubmitted, this);
                _ref = SubmitDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            SubmitDecor.prototype.watch = false;
            SubmitDecor.prototype.bind = function() {
                SubmitDecor.__super__.bind.call(this);
                return $(this.element).bind(this.name, this._onSubmitted);
            };
            SubmitDecor.prototype._onSubmitted = function(event) {
                event.preventDefault();
                this.clip.data.set("event", event);
                return this.script.update();
            };
            return SubmitDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = SubmitDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/enter.js", function(require, module, exports, __dirname, __filename) {
        var EnterDecor, _ref, __bind = function(fn, me) {
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
        EnterDecor = function(_super) {
            __extends(EnterDecor, _super);
            function EnterDecor() {
                this._onKeyUp = __bind(this._onKeyUp, this);
                _ref = EnterDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            EnterDecor.prototype.watch = false;
            EnterDecor.prototype.bind = function() {
                EnterDecor.__super__.bind.call(this);
                return $(this.element).bind("keyup", this._onKeyUp);
            };
            EnterDecor.prototype._onKeyUp = function(event) {
                if (event.keyCode !== 13) {
                    return;
                }
                return this.script.update();
            };
            return EnterDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = EnterDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/disable.js", function(require, module, exports, __dirname, __filename) {
        var DisableDecor, _ref, __bind = function(fn, me) {
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
        DisableDecor = function(_super) {
            __extends(DisableDecor, _super);
            function DisableDecor() {
                this._show = __bind(this._show, this);
                _ref = DisableDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            DisableDecor.prototype.bind = function() {
                DisableDecor.__super__.bind.call(this);
                this.$element = $(this.element);
                this.clip.bind("disable").to(this._show).now();
                return this._show(this.clip.get("disable"));
            };
            DisableDecor.prototype._show = function(value) {
                if (value) {
                    return this.$element.attr("disabled", "disabled");
                } else {
                    return this.$element.removeAttr("disabled", "disabled");
                }
            };
            return DisableDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = DisableDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/checked.js", function(require, module, exports, __dirname, __filename) {
        var CheckedDecor, _ref, __bind = function(fn, me) {
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
        CheckedDecor = function(_super) {
            __extends(CheckedDecor, _super);
            function CheckedDecor() {
                this._show = __bind(this._show, this);
                _ref = CheckedDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            CheckedDecor.prototype.bind = function() {
                CheckedDecor.__super__.bind.call(this);
                return this.clip.bind("checked").to(this._show).now();
            };
            CheckedDecor.prototype._show = function(value) {
                return this.element.checked = value;
            };
            return CheckedDecor;
        }(require("paperclip/lib/paper/decor/attr/dataBind.js"));
        module.exports = CheckedDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/dataBind.js", function(require, module, exports, __dirname, __filename) {
        var DataBindDecor, __bind = function(fn, me) {
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
        DataBindDecor = function(_super) {
            __extends(DataBindDecor, _super);
            function DataBindDecor(node, name, clip) {
                this.name = name;
                this.clip = clip;
                this._onChange = __bind(this._onChange, this);
                this.attrName = "data-bind";
                this.script = clip.script(this.name);
                this.refs = this.script.script.refs;
                DataBindDecor.__super__.constructor.call(this, node, this.name);
            }
            DataBindDecor.prototype.load = function(context) {
                if (this.watch !== false) {
                    this.script.update();
                }
                return DataBindDecor.__super__.load.call(this, context);
            };
            DataBindDecor.prototype.bind = function() {
                this.clip.bind(this.name).to(this._onChange);
                this.element = this.node.section.elements[0];
                if (this.watch !== false) {
                    return this.script.watch();
                }
            };
            DataBindDecor.prototype._onChange = function(value) {};
            return DataBindDecor;
        }(require("paperclip/lib/paper/decor/attr/base.js"));
        module.exports = DataBindDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/attr/text.js", function(require, module, exports, __dirname, __filename) {
        var TextBinding, __bind = function(fn, me) {
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
        TextBinding = function(_super) {
            __extends(TextBinding, _super);
            function TextBinding(node, attrName, clippedBuffer) {
                this.attrName = attrName;
                this.clippedBuffer = clippedBuffer;
                this._onChange = __bind(this._onChange, this);
                TextBinding.__super__.constructor.call(this, node);
            }
            TextBinding.prototype.bind = function() {
                TextBinding.__super__.bind.call(this);
                return this.clippedBuffer.bind("text").to(this._onChange);
            };
            TextBinding.prototype.load = function(context) {
                this.context = context;
                this.clippedBuffer.reset(context);
                if (this.clippedBuffer.text.length) {
                    return context.buffer.push(" " + this.attrName + '="' + this.clippedBuffer.text + '"');
                }
            };
            TextBinding.prototype._onChange = function(value) {
                return this.node.section.elements[0].setAttribute(this.attrName, value);
            };
            return TextBinding;
        }(require("paperclip/lib/paper/decor/attr/base.js"));
        module.exports = TextBinding;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/html.js", function(require, module, exports, __dirname, __filename) {
        var HtmlDecor, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        HtmlDecor = function(_super) {
            __extends(HtmlDecor, _super);
            function HtmlDecor() {
                _ref = HtmlDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            HtmlDecor.prototype.load = function(context) {
                var html;
                html = this.clip.get("html");
                if (html == null) {
                    return;
                }
                if (typeof html === "string" || (html != null ? html.__isSection : void 0)) {
                    return context.buffer.push(html);
                } else {
                    this.child = html.createContent();
                    return this.child.load(context);
                }
            };
            HtmlDecor.prototype.bind = function() {
                var _ref1;
                HtmlDecor.__super__.bind.call(this);
                return (_ref1 = this.child) != null ? _ref1.bind() : void 0;
            };
            HtmlDecor.prototype.dispose = function() {
                var _ref1;
                HtmlDecor.__super__.dispose.call(this);
                return (_ref1 = this.child) != null ? _ref1.dispose() : void 0;
            };
            return HtmlDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = HtmlDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/when.js", function(require, module, exports, __dirname, __filename) {
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
            BlockDecor.prototype.load = function(context) {
                this.context = context;
                if (this._show = !!this.clip.get("when")) {
                    this.child = this.node.createContent();
                    return this.child.load(context);
                }
            };
            BlockDecor.prototype.bind = function() {
                var _ref1;
                BlockDecor.__super__.bind.call(this);
                return (_ref1 = this.child) != null ? _ref1.bind() : void 0;
            };
            BlockDecor.prototype._onChange = function(value) {
                var show, _ref1;
                show = !!value;
                if (this._show === show) {
                    return;
                }
                this._show = show;
                if (show) {
                    return this.child = this.node.createContent().attach(this.node, this.context).bind();
                } else {
                    if ((_ref1 = this.child) != null) {
                        _ref1.dispose();
                    }
                    return this.child = void 0;
                }
            };
            return BlockDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = BlockDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/with.js", function(require, module, exports, __dirname, __filename) {
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
            BlockDecor.scriptName = "with";
            BlockDecor.prototype.load = function(context) {
                this.context = context;
                this.child = this.node.createContent();
                return this.child.load(this._childContext(context));
            };
            BlockDecor.prototype._childContext = function(context) {
                return context.child(this.clip.get("with"));
            };
            BlockDecor.prototype.bind = function() {
                BlockDecor.__super__.bind.call(this);
                return this.child.bind();
            };
            BlockDecor.prototype._onChange = function(value) {
                return this.child.context.reset(value);
            };
            return BlockDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = BlockDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/each.js", function(require, module, exports, __dirname, __filename) {
        var EachDecor, pilot, __bind = function(fn, me) {
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
        pilot = require("pilot-block/lib/index.js");
        EachDecor = function(_super) {
            __extends(EachDecor, _super);
            function EachDecor() {
                this._remove = __bind(this._remove, this);
                this._insert = __bind(this._insert, this);
                EachDecor.__super__.constructor.apply(this, arguments);
            }
            EachDecor.prototype.bind = function() {
                var child, _i, _len, _ref, _ref1;
                EachDecor.__super__.bind.call(this);
                _ref = this.children;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    child.bind();
                }
                if ((_ref1 = this.script.value) != null ? _ref1.source : void 0) {
                    this._ignoreInsert = true;
                    this.script.value.bind({
                        insert: this._insert,
                        remove: this._remove
                    }).now();
                    return this._ignoreInsert = false;
                }
            };
            EachDecor.prototype.load = function(context) {
                var child, model, source, _i, _j, _len, _len1, _ref, _ref1, _results;
                this.context = context;
                this.children = [];
                this.itemName = source = ((_ref = this.script.value) != null ? _ref.source : void 0) ? this.script.value.source() : this.script.value || [];
                for (_i = 0, _len = source.length; _i < _len; _i++) {
                    model = source[_i];
                    this.children.push(this._createChild(model));
                }
                _ref1 = this.children;
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    child = _ref1[_j];
                    _results.push(child.load(context));
                }
                return _results;
            };
            EachDecor.prototype._createChild = function(model) {
                var data, node;
                data = {};
                data[this.node.clip.get("as") || "model"] = model;
                node = this.node.createContent(data);
                node.model = model;
                return node;
            };
            EachDecor.prototype._insert = function(model) {
                var node;
                if (this._ignoreInsert) {
                    return;
                }
                this.children.push(node = this._createChild(model));
                return node.attach(this.node, this.context);
            };
            EachDecor.prototype._remove = function(model) {
                var child, i, _i, _len, _ref, _results;
                _ref = this.children;
                _results = [];
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    child = _ref[i];
                    if (child.model === model) {
                        this.children.splice(i, 1);
                        child.dispose();
                        break;
                    } else {
                        _results.push(void 0);
                    }
                }
                return _results;
            };
            return EachDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = EachDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/value.js", function(require, module, exports, __dirname, __filename) {
        var ValueDecor, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        ValueDecor = function(_super) {
            __extends(ValueDecor, _super);
            function ValueDecor() {
                _ref = ValueDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ValueDecor.prototype.load = function(context) {
                var v;
                v = this.clip.get("value");
                if (v != null) {
                    return context.buffer.push(v);
                }
            };
            ValueDecor.prototype._onChange = function(value) {
                return this.node.section.html(value);
            };
            return ValueDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = ValueDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/block.js", function(require, module, exports, __dirname, __filename) {
        var BlockDecor, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
                _ref = BlockDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            BlockDecor.prototype.load = function(context) {
                return context.set(this.clip.get("block"), this.node);
            };
            return BlockDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = BlockDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/template.js", function(require, module, exports, __dirname, __filename) {
        var TemplateDecor, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        TemplateDecor = function(_super) {
            __extends(TemplateDecor, _super);
            function TemplateDecor() {
                _ref = TemplateDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            TemplateDecor.prototype.load = function(context) {
                return context.internal.set("template." + (this.clip.get("template.name") || this.clip.get("template")), this);
            };
            return TemplateDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = TemplateDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/view.js", function(require, module, exports, __dirname, __filename) {
        var ViewDecor, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
        ViewDecor = function(_super) {
            __extends(ViewDecor, _super);
            function ViewDecor() {
                _ref = ViewDecor.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ViewDecor.prototype.bind = function() {
                ViewDecor.__super__.bind.call(this);
                return this.child.bind();
            };
            ViewDecor.prototype.dispose = function() {
                ViewDecor.__super__.dispose.call(this);
                return this.child.dispose();
            };
            ViewDecor.prototype.load = function(context) {
                var child, tpl, tplName, wth;
                tplName = "template." + (this.clip.get("view.name") || this.clip.get("view"));
                wth = this.clip.get("view.model") || void 0;
                tpl = context.internal.get(tplName);
                if (!tpl) {
                    return;
                }
                child = context.child().detachBuffer();
                if (this.node.content) {
                    this.node.content.load(child);
                }
                child.set("content", child.buffer.join(""));
                child.attachBuffer();
                this.child = tpl.node.createContent();
                return this.child.load(this._childContext = child.child(wth));
            };
            ViewDecor.prototype._onChange = function() {
                var _ref1;
                return (_ref1 = this._childContext) != null ? _ref1.reset(this.clip.get("view.model")) : void 0;
            };
            return ViewDecor;
        }(require("paperclip/lib/paper/decor/block/base.js"));
        module.exports = ViewDecor;
        return module.exports;
    });
    define("bindable/lib/object/setters/base.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var utils;
            utils = require("bindable/lib/core/utils.js");
            module.exports = function() {
                function _Class(binding) {
                    this.binding = binding;
                    this._transformer = this.binding.transform();
                }
                _Class.prototype.change = function(value) {
                    var transformedValue;
                    transformedValue = this.__transform("to", value);
                    if (this._value === transformedValue) {
                        return;
                    }
                    this._value = transformedValue;
                    return this._change(transformedValue);
                };
                _Class.prototype.bothWays = function() {};
                _Class.prototype._change = function(value) {};
                _Class.prototype.__transform = function(method, value) {
                    return utils.tryTransform(this._transformer, method, value);
                };
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
                    var i, item, _i, _len, _ref1, _results;
                    if (this._initialized) {
                        return;
                    }
                    this._initialized = true;
                    _ref1 = this.binding._from.source();
                    _results = [];
                    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
                        item = _ref1[i];
                        _results.push(this.change("insert", item));
                    }
                    return _results;
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
    define("paperclip/lib/paper/decor/attr/base.js", function(require, module, exports, __dirname, __filename) {
        var BaseDecor;
        BaseDecor = function() {
            function BaseDecor(node, name) {
                this.node = node;
                this.name = name;
            }
            BaseDecor.prototype.load = function(context) {
                this.context = context;
            };
            BaseDecor.prototype.bind = function() {};
            BaseDecor.prototype.dispose = function() {};
            return BaseDecor;
        }();
        module.exports = BaseDecor;
        return module.exports;
    });
    define("paperclip/lib/paper/decor/block/base.js", function(require, module, exports, __dirname, __filename) {
        var NodeDecor, __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        };
        NodeDecor = function() {
            function NodeDecor(node, scriptName) {
                this.node = node;
                this.scriptName = scriptName;
                this._onChange = __bind(this._onChange, this);
                this.script = node.clip.script(this.scriptName);
                this.clip = node.clip;
            }
            NodeDecor.prototype.load = function(context) {};
            NodeDecor.prototype.bind = function() {
                return this.clip.bind(this.scriptName).to(this._onChange);
            };
            NodeDecor.prototype.dispose = function() {};
            NodeDecor.prototype._onChange = function(value) {};
            NodeDecor.test = function(node) {
                return false;
            };
            return NodeDecor;
        }();
        module.exports = NodeDecor;
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
                    return this._change(event, this.__transform("to", item), oldItem);
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
                        changed[i] = this.__transform("to", item);
                    }
                    return this._change(events, changed, oldItems);
                };
                _Class.prototype._change = function(event, item) {};
                _Class.prototype.bothWays = function() {};
                _Class.prototype.__transform = function(method, value) {
                    return utils.tryTransform(this._transformer, method, value);
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