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
    define("paperclip/lib/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Clip, Paper, Paperclip;
            Clip = require("paperclip/lib/clip/index.js");
            Paper = require("paperclip/lib/paper/index.js");
            Paperclip = function() {
                function Paperclip() {}
                Paperclip.prototype.attach = function(data, element) {
                    var dom;
                    dom = new Paper.DOM;
                    return dom.attach(data, element);
                };
                return Paperclip;
            }();
            module.exports = function() {
                return new Paperclip;
            };
            module.exports.Clip = Clip;
            module.exports.Paper = Paper;
            module.exports.bindable = require("bindable/lib/index.js");
            if (typeof window !== "undefined") {
                window.paperclip = module.exports;
            }
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Clip, ClipWatchers, PropertyChain, ScriptWatcher, bindable, defaultModifiers, dref, events, __bind = function(fn, me) {
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
            dref = require("dref/lib/index.js");
            events = require("events/index.js");
            defaultModifiers = require("paperclip/lib/clip/modifiers/index.js");
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
            ScriptWatcher = function(_super) {
                __extends(ScriptWatcher, _super);
                function ScriptWatcher(script, clip) {
                    this.script = script;
                    this.clip = clip;
                    this.update = __bind(this.update, this);
                    this.modifiers = this.clip.modifiers;
                    this.defaultModifiers = defaultModifiers;
                    this.options = this.clip.options;
                    this._watching = {};
                    this.cast = {};
                }
                ScriptWatcher.prototype.dispose = function() {
                    var key;
                    for (key in this._watching) {
                        this._watching[key].binding.dispose();
                    }
                    return this._watching = {};
                };
                ScriptWatcher.prototype.update = function() {
                    var newValue;
                    newValue = this.script.call(this);
                    if (newValue === this.value) {
                        return newValue;
                    }
                    this.emit("change", this.value = newValue);
                    return newValue;
                };
                ScriptWatcher.prototype.watch = function() {
                    this.__watch = true;
                    this.update();
                    return this;
                };
                ScriptWatcher.prototype.modify = function(modifier, args) {
                    var ret;
                    this.currentRefs = args.filter(function(arg) {
                        return arg.__isPropertyChain;
                    });
                    ret = modifier.apply(this, args.map(function(arg) {
                        if (arg.__isPropertyChain) {
                            return arg.value();
                        } else {
                            return arg;
                        }
                    }));
                    this.currentRefs = [];
                    return ret;
                };
                ScriptWatcher.prototype.castAs = function(name) {
                    return (new PropertyChain(this)).castAs(name);
                };
                ScriptWatcher.prototype.ref = function(path) {
                    return (new PropertyChain(this)).ref(path);
                };
                ScriptWatcher.prototype.self = function(path) {
                    return (new PropertyChain(this)).self(path);
                };
                ScriptWatcher.prototype.call = function(path, args) {
                    return (new PropertyChain(this)).call(path, args);
                };
                ScriptWatcher.prototype._watch = function(path, target) {
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
                        binding: target.bind(path).watch(true).to(this.update)
                    };
                };
                return ScriptWatcher;
            }(events.EventEmitter);
            ClipWatchers = function() {
                function ClipWatchers(clip, scripts) {
                    this.clip = clip;
                    this._watchers = {};
                    this.names = [];
                    this._bindScripts(scripts);
                }
                ClipWatchers.prototype.watch = function() {
                    var key, _results;
                    _results = [];
                    for (key in this._watchers) {
                        _results.push(this._watchers[key].watch());
                    }
                    return _results;
                };
                ClipWatchers.prototype.dispose = function() {
                    var key;
                    for (key in this._watchers) {
                        this._watchers[key].dispose();
                    }
                    return this._watchers = {};
                };
                ClipWatchers.prototype.get = function(name) {
                    return this._watchers[name];
                };
                ClipWatchers.prototype._bindScripts = function(scripts) {
                    var scriptName, _results;
                    if (typeof scripts === "function") {
                        return this._bindScript("value", scripts, true);
                    } else {
                        _results = [];
                        for (scriptName in scripts) {
                            _results.push(this._bindScript(scriptName, scripts[scriptName]));
                        }
                        return _results;
                    }
                };
                ClipWatchers.prototype._bindScript = function(name, script, watch) {
                    var watcher, _this = this;
                    this.names.push(name);
                    watcher = new ScriptWatcher(script, this.clip);
                    this._watchers[name] = watcher;
                    watcher.on("change", function(value) {
                        return _this.clip.set(name, value);
                    });
                    if (watch) {
                        return watcher.watch();
                    }
                };
                return ClipWatchers;
            }();
            Clip = function() {
                function Clip(options) {
                    this.options = options;
                    this._self = new bindable.Object;
                    this.data = new bindable.Object(options.data || {});
                    this.modifiers = options.modifiers || {};
                    if (this.options.script) {
                        this.watchers = new ClipWatchers(this, this.options.script);
                    }
                }
                Clip.prototype.watch = function() {
                    this.watchers.watch();
                    return this;
                };
                Clip.prototype.dispose = function() {
                    var _ref, _ref1;
                    if ((_ref = this._self) != null) {
                        _ref.dispose();
                    }
                    if ((_ref1 = this.watchers) != null) {
                        _ref1.dispose();
                    }
                    this._self = void 0;
                    return this._watchers = void 0;
                };
                Clip.prototype.watcher = function(name) {
                    return this.watchers.get(name);
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
            module.exports.Watchers = ClipWatchers;
            module.exports.modifiers = defaultModifiers;
            module.exports.compile = require("paperclip/lib/clip/compile.js");
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            exports.Template = require("paperclip/lib/paper/template/index.js");
            exports.DOM = require("paperclip/lib/paper/dom/index.js");
        }).call(this);
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
    define("bindable/lib/object/binding.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableSetter, Binding, bindableSetter, deepPropertyWatcher, hoist, toarray, utils, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            BindableSetter = require("bindable/lib/object/setters/factory.js");
            bindableSetter = new BindableSetter;
            utils = require("bindable/lib/core/utils.js");
            hoist = require("hoist/lib/index.js");
            toarray = require("toarray/index.js");
            deepPropertyWatcher = require("bindable/lib/object/deepPropertyWatcher.js");
            module.exports = Binding = function() {
                Binding.prototype.__isBinding = true;
                function Binding(_from, _property) {
                    this._from = _from;
                    this._property = _property;
                    this._trigger = __bind(this._trigger, this);
                    this.dispose = __bind(this.dispose, this);
                    this._limit = -1;
                    this._setters = [];
                    this._triggerCount = 0;
                    this._listen();
                }
                Binding.prototype.watch = function(value) {
                    if (!arguments.length) {
                        return this._watch;
                    }
                    this._watch = value;
                    return this;
                };
                Binding.prototype.collection = function() {
                    if (this._collectionBinding) {
                        return this._collectionBinding;
                    }
                    this._collection = new Binding.Collection;
                    this.to(this._collection.source);
                    return this._collectionBinding = this._collection.bind().copyId(true);
                };
                Binding.prototype.to = function(target, property) {
                    var setter;
                    setter = bindableSetter.createSetter(this, target, property);
                    if (setter) {
                        this._setters.push(setter);
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
                    if (this._boundBothWays) {
                        return this;
                    }
                    this._boundBothWays = true;
                    this._callSetterFns("bothWays");
                    return this;
                };
                Binding.prototype.dispose = function() {
                    this._callSetterFns("dispose");
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
                Binding.prototype._trigger = function() {
                    this._callSetterFns("change", [ this._from.get(this._property) ]);
                    if (~this._limit && ++this._triggerCount > this._limit) {
                        this.dispose();
                    }
                    return this;
                };
                Binding.prototype._callSetterFns = function(method, args) {
                    var setter, _i, _len, _ref, _results;
                    _ref = this._setters;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        _results.push(setter[method].apply(setter, args || []));
                    }
                    return _results;
                };
                Binding.prototype._listen = function() {
                    this._listener = deepPropertyWatcher.create({
                        target: this._from,
                        property: this._property,
                        callback: this._trigger
                    });
                    return this._disposeListener = this._from.once("dispose", this.dispose);
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
                return binding;
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/object/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Bindable, Binding, Builder, EventEmitter, dref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            Builder = require("bindable/lib/core/builder.js");
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
                Bindable.prototype.getFlatten = function(key) {
                    return this.get(key, true);
                };
                Bindable.prototype.has = function(key) {
                    return !!this.get(key);
                };
                Bindable.prototype.set = function(key, value) {
                    var k;
                    if (arguments.length === 1) {
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
                Bindable.prototype._set = function(key, value) {
                    if (!dref.set(this, key, value)) {
                        return this;
                    }
                    this.emit("change:" + key, value);
                    this.emit("change", value);
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
            new Builder(Binding, Bindable);
            module.exports.EventEmitter = EventEmitter;
            module.exports.propertyWatcher = require("bindable/lib/object/deepPropertyWatcher.js");
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindableObject, Binding, EventEmitter, dref, hoist, isa, __bind = function(fn, me) {
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
            isa = require("isa/isa.js");
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
                    if (typeof source === "string") {
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
                    return this;
                };
                _Class.prototype.disposeSourceBinding = function() {
                    if (this._sourceBinding) {
                        this._sourceBinding.dispose();
                        return this._sourceBinding = void 0;
                    }
                };
                _Class.prototype.bind = function(to) {
                    if (typeof to === "string") {
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
                    if (isa.array(item)) {
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
    define("dref/lib/index.js", function(require, module, exports, __dirname, __filename) {
        var _gss = global._gss = global._gss || [];
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
                keyParts = (keyParts instanceof Array ? keyParts : keyParts.split(".")).filter(function(part) {
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
    define("paperclip/lib/clip/modifiers/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            module.exports = {
                uppercase: function(value) {
                    return String(value).toUpperCase();
                },
                lowercase: function(value) {
                    return String(value).toLowerCase();
                },
                bothWays: function(value, y) {
                    if (y == null) {
                        y = true;
                    }
                    if (!this.options.bothWays) {
                        this.options.bothWays = {};
                    }
                    this.options.bothWays[this.currentRefs[0].path()] = y ? this.currentRefs[0] : void 0;
                    return value;
                },
                json: function(value, count, delimiter) {
                    return JSON.stringify.apply(JSON, arguments);
                },
                replace: function(ref, newValue) {
                    var _i, _len, _ref;
                    _ref = this.currentRefs;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        ref = _ref[_i];
                        ref.value(newValue);
                    }
                    return newValue;
                }
            };
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/compile.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Compiler, Parser, compiler;
            Parser = require("paperclip/lib/clip/parser.js");
            Compiler = function() {
                function Compiler() {
                    this._parser = new Parser;
                }
                Compiler.prototype.compile = function(script) {
                    var expression, scripts, _i, _len, _ref;
                    expression = this._parser.parse(script);
                    scripts = {};
                    if (expression._type === "script") {
                        return this._getScript(expression);
                    }
                    _ref = expression.items;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        script = _ref[_i];
                        scripts[script.name] = this._getScript(script.options);
                    }
                    return scripts;
                };
                Compiler.prototype._getScript = function(script) {
                    return new Function("return " + script);
                };
                return Compiler;
            }();
            compiler = new Compiler;
            module.exports = function(script) {
                return compiler.compile(script);
            };
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/template/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Clip, Parser, Template, TemplateBinding, TemplateRenderer, bindable, events, parser, __bind = function(fn, me) {
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
            Parser = require("paperclip/lib/paper/template/parser.js");
            Clip = require("paperclip/lib/clip/index.js");
            events = require("events/index.js");
            bindable = require("bindable/lib/index.js");
            parser = new Parser;
            TemplateBinding = function() {
                function TemplateBinding(renderer, fn) {
                    this.renderer = renderer;
                    this.fn = fn;
                    this.update = __bind(this.update, this);
                    this.clip = new Clip({
                        script: this.fn,
                        data: this.renderer._data
                    });
                    this.clip.bind("value").watch(true).to(this.update);
                    this.value = this.clip.get("value");
                }
                TemplateBinding.prototype.dispose = function() {
                    return this.clip.dispose();
                };
                TemplateBinding.prototype.update = function(value) {
                    this.value = value;
                    return this.renderer.update();
                };
                TemplateBinding.prototype.toString = function() {
                    return this.value;
                };
                return TemplateBinding;
            }();
            TemplateRenderer = function(_super) {
                __extends(TemplateRenderer, _super);
                function TemplateRenderer(_data, fn) {
                    this._data = _data;
                    this.fn = fn;
                    TemplateRenderer.__super__.constructor.call(this);
                    this.buffer = [];
                    this.bindings = [];
                    this.fn.call(this);
                    this.update();
                }
                TemplateRenderer.prototype.dispose = function() {
                    var binding, _i, _len, _ref;
                    _ref = this.bindings;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        binding = _ref[_i];
                        binding.dispose();
                    }
                    return this.bindings = [];
                };
                TemplateRenderer.prototype.push = function(source) {
                    this.buffer.push(source);
                    return this;
                };
                TemplateRenderer.prototype.pushBinding = function(script) {
                    var binding;
                    this.buffer.push(binding = new TemplateBinding(this, script));
                    this.bindings.push(binding);
                    return this;
                };
                TemplateRenderer.prototype.update = function() {
                    return this.set("text", this.text = this.render());
                };
                TemplateRenderer.prototype.render = function() {
                    return this.buffer.join("");
                };
                TemplateRenderer.prototype.toString = function() {
                    return this.text;
                };
                return TemplateRenderer;
            }(bindable.Object);
            Template = function() {
                function Template(source) {
                    this.fn = new Function("return " + parser.parse(source));
                }
                Template.prototype.render = function(data) {
                    return new TemplateRenderer(data, this.fn);
                };
                return Template;
            }();
            module.exports = Template;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var DOM, DecororFactory;
            DecororFactory = require("paperclip/lib/paper/dom/decor/index.js");
            DOM = function() {
                function DOM() {
                    this._decorFactory = new DecororFactory;
                }
                DOM.prototype.attach = function(context, element) {
                    var _this = this;
                    return this._traverse(this._element(element), function(element) {
                        var decor;
                        decor = _this._decorFactory.attach(context, element);
                        if (decor) {
                            decor.dom = _this;
                            decor.init();
                            return decor.traverse !== false;
                        }
                    });
                };
                DOM.prototype._traverse = function(element, callback) {
                    var child, traverse, _i, _len, _ref, _results;
                    if (element.nodeName === "#comment") {
                        return;
                    }
                    traverse = callback(element);
                    if (traverse === false) {
                        return;
                    }
                    _ref = element.childNodes;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        if (this._traverse(child, callback) === false) {
                            break;
                        } else {
                            _results.push(void 0);
                        }
                    }
                    return _results;
                };
                DOM.prototype._element = function(element) {
                    return element[0] || element;
                };
                return DOM;
            }();
            module.exports = DOM;
        }).call(this);
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
            exports.tryTransform = function(transformer, method, value, callback) {
                if (!transformer) {
                    return callback(null, value);
                }
                return transformer[method].call(transformer, value, callback);
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
    define("toarray/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = function(item) {
            if (item === undefined) return [];
            return item instanceof Array ? item : [ item ];
        };
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
    define("bindable/lib/core/builder.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Builder, CallChain;
            CallChain = function() {
                CallChain.prototype.__isCallChain = true;
                function CallChain(_targetClass, methods) {
                    this._targetClass = _targetClass;
                    this._addMethods(methods);
                    this._callChain = [];
                }
                CallChain.prototype.createObject = function() {
                    var C, args, call, clazz, obj, _i, _len, _ref, _results;
                    clazz = this._targetClass;
                    args = arguments;
                    C = function() {
                        return clazz.apply(this, args);
                    };
                    C.prototype = clazz.prototype;
                    obj = new C;
                    _ref = this._callChain;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        call = _ref[_i];
                        _results.push(obj = obj[call.method].apply(obj, call.args));
                    }
                    return _results;
                };
                CallChain.prototype.copyId = function(value) {
                    if (!arguments.length) {
                        return this._copyId;
                    }
                    this._copyId = value;
                    return this;
                };
                CallChain.prototype.callMethod = function(method, args) {
                    this._callChain.push({
                        method: method,
                        args: args
                    });
                    return this;
                };
                CallChain.prototype._addMethods = function(methods) {
                    var method, _i, _len;
                    for (_i = 0, _len = methods.length; _i < _len; _i++) {
                        method = methods[_i];
                        this._addMethod(method);
                    }
                    return this;
                };
                CallChain.prototype._addMethod = function(method) {
                    return this[method] = function() {
                        return this.callMethod(method, arguments);
                    };
                };
                return CallChain;
            }();
            module.exports = Builder = function() {
                function Builder(_class, _attach) {
                    this._class = _class;
                    this._attach = _attach != null ? _attach : this;
                    this._createMethods();
                }
                Builder.prototype._createMethods = function() {
                    var key, _results;
                    this._methods = [];
                    _results = [];
                    for (key in this._class.prototype) {
                        if (key.substr(0, 1) === "_") {
                            continue;
                        }
                        _results.push(this._addMethod(key));
                    }
                    return _results;
                };
                Builder.prototype._addMethod = function(method) {
                    var _this = this;
                    this._methods.push(method);
                    return this._attach[method] = function() {
                        return (new CallChain(_this._class, _this._methods)).callMethod(method, arguments);
                    };
                };
                return Builder;
            }();
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/binding.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var SettersFactory, settersFactory, sift, utils;
            sift = require("sift/sift.js");
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
                    this._filter = sift(search);
                    return this;
                };
                _Class.prototype.to = function(collection) {
                    var setter;
                    setter = settersFactory.createSetter(this, collection);
                    if (setter) {
                        this._setters.push(setter);
                    }
                    return this;
                };
                _Class.prototype._listen = function() {
                    var event, _i, _len, _ref, _results, _this = this;
                    this._listeners = [];
                    _ref = [ "insert", "remove", "update" ];
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
                _Class.prototype._callSetters = function(method, item) {
                    var setter, _i, _len, _ref, _results;
                    _ref = this._setters;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        setter = _ref[_i];
                        _results.push(setter.change(method, item));
                    }
                    return _results;
                };
                return _Class;
            }();
        }).call(this);
        return module.exports;
    });
    define("isa/isa.js", function(require, module, exports, __dirname, __filename) {
        (function(undefined) {
            "use strict";
            var toString = Object.prototype.toString;
            var isa = {};
            isa.number = function(o) {
                return "number" === typeof o && !isNaN(o);
            };
            [ "string", "boolean", "undefined", "function" ].forEach(function(p) {
                isa[p] = function(o) {
                    this.name = p;
                    return p === typeof o;
                };
            });
            isa.bool = isa.boolean;
            isa.null = function(o) {
                return null === o;
            };
            isa.array = function(o) {
                return Array.isArray ? Array.isArray(o) : "[object Array]" === toString.call(o);
            };
            isa.nan = isa.NaN = function(o) {
                return !this.number(o);
            };
            module.exports = isa;
        })();
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
    define("paperclip/lib/clip/parser.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var ActionExpression, ActionsExpression, BaseParser, CollectionExpression, FnExpression, GroupExpression, JsExpression, ModifierExpression, OptionsExpression, ParamsExpression, Parser, RefExpression, RefPathExpression, ScriptExpression, StringExpression, TokenCodes, Tokenizer, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            Tokenizer = require("paperclip/lib/clip/tokenizer.js");
            TokenCodes = Tokenizer.codes;
            BaseParser = require("paperclip/lib/base/parser.js");
            ModifierExpression = require("paperclip/lib/clip/expressions/modifier.js");
            ScriptExpression = require("paperclip/lib/clip/expressions/script.js");
            ActionExpression = require("paperclip/lib/clip/expressions/action.js");
            ActionsExpression = require("paperclip/lib/clip/expressions/actions.js");
            OptionsExpression = require("paperclip/lib/clip/expressions/options.js");
            RefExpression = require("paperclip/lib/clip/expressions/ref.js");
            RefPathExpression = require("paperclip/lib/clip/expressions/refPath.js");
            FnExpression = require("paperclip/lib/clip/expressions/fn.js");
            JsExpression = require("paperclip/lib/clip/expressions/js.js");
            ParamsExpression = require("paperclip/lib/clip/expressions/params.js");
            CollectionExpression = require("paperclip/lib/base/collectionExpression.js");
            StringExpression = require("paperclip/lib/clip/expressions/string.js");
            GroupExpression = require("paperclip/lib/clip/expressions/group.js");
            Parser = function(_super) {
                __extends(Parser, _super);
                function Parser() {
                    Parser.__super__.constructor.call(this, new Tokenizer);
                }
                Parser.prototype._parse = function() {
                    switch (this._nextCode()) {
                      case TokenCodes.VAR:
                        return this._parseActionsOrOptions();
                      case TokenCodes.LB:
                        return this._parseMultiOptions();
                      default:
                        return this._parseReference();
                    }
                };
                Parser.prototype._parseActionsOrOptions = function() {
                    var actions, pn;
                    actions = [];
                    if (!(pn = this._t.peekNext()) || pn[0] !== TokenCodes.COLON) {
                        return this._parseActionOptions();
                    }
                    while (this._t.current) {
                        actions.push(this._parseAction());
                        if (this._currentCode() === TokenCodes.SEMI_COLON) {
                            this._nextCode();
                        }
                    }
                    return new ActionsExpression(actions);
                };
                Parser.prototype._parseAction = function() {
                    var name;
                    name = this._currentString();
                    this._expectNextCode(TokenCodes.COLON);
                    this._nextCode();
                    return new ActionExpression(name, this._parseActionOptions());
                };
                Parser.prototype._parseActionOptions = function() {
                    switch (this._currentCode()) {
                      case TokenCodes.LB:
                        return this._parseMultiOptions();
                      default:
                        return this._parseReference();
                    }
                };
                Parser.prototype._parseMultiOptions = function() {
                    var c, ops, options;
                    c = this._currentCode();
                    options = [];
                    while (c && (c = this._currentCode()) !== TokenCodes.RB) {
                        this._nextCode();
                        ops = {
                            name: this._currentString()
                        };
                        this._expectNextCode(TokenCodes.COLON);
                        this._nextCode();
                        ops.expression = this._parseActionOptions();
                        options.push(ops);
                    }
                    this._nextCode();
                    return new OptionsExpression(options);
                };
                Parser.prototype._parseReference = function() {
                    var c, expressions, modifiers;
                    expressions = [];
                    modifiers = [];
                    while (c = this._currentCode()) {
                        if (c === TokenCodes.VAR) {
                            expressions.push(this._parseRef());
                            c = this._currentCode();
                        }
                        if (c === TokenCodes.LP) {
                            expressions.push(this._parseGroup());
                            c = this._currentCode();
                        }
                        if (c === TokenCodes.LB) {
                            expressions.push(this._parseActionOptions());
                            c = this._currentCode();
                        }
                        if (c === TokenCodes.STRING) {
                            expressions.push(new StringExpression(this._currentString()));
                            c = this._nextCode();
                        }
                        while (c === TokenCodes.PIPE) {
                            this._nextCode();
                            expressions.push(this._parsePipe(expressions.pop()));
                            c = this._currentCode();
                        }
                        if (~[ TokenCodes.RP, TokenCodes.RB ].indexOf(c)) {
                            break;
                        }
                        if (!c || ~[ TokenCodes.SEMI_COLON, TokenCodes.COMA ].indexOf(c)) {
                            break;
                        }
                        expressions.push(new JsExpression(this._currentString()));
                        this._nextCode();
                    }
                    if (this._currentCode() === TokenCodes.SEMI_COLON) {
                        this._nextCode();
                    }
                    return new ScriptExpression(new CollectionExpression(expressions));
                };
                Parser.prototype._parsePipe = function(expressions) {
                    var name, params;
                    name = this._currentString();
                    params = [];
                    this._nextCode();
                    return new ModifierExpression(name, this._parseParams(), expressions);
                };
                Parser.prototype._parseParams = function() {
                    return new ParamsExpression(this._parseParams2());
                };
                Parser.prototype._parseParams2 = function() {
                    var c, params;
                    this._expectCurrentCode(TokenCodes.LP);
                    params = [];
                    while (c = this._nextCode()) {
                        if (c === TokenCodes.RP) {
                            break;
                        }
                        params.push(this._parseReference());
                        c = this._currentCode();
                        if (c !== TokenCodes.COMA) {
                            break;
                        }
                    }
                    this._nextCode();
                    return params;
                };
                Parser.prototype._parseGroup = function() {
                    return new GroupExpression(this._parseParams2());
                };
                Parser.prototype._parseRef = function() {
                    var c, castAs, name, refs;
                    c = this._currentCode();
                    refs = [];
                    while (c === TokenCodes.VAR) {
                        name = this._currentString();
                        if ((c = this._nextCode()) === TokenCodes.LP) {
                            refs.push(new FnExpression(name, this._parseParams()));
                            c = this._currentCode();
                        } else {
                            refs.push(new RefExpression(name));
                        }
                        if (c === TokenCodes.DOT) {
                            c = this._nextCode();
                        }
                    }
                    if (c === TokenCodes.AS) {
                        this._nextCode();
                        castAs = this._currentString();
                        this._nextCode();
                    }
                    return new RefPathExpression(refs, castAs);
                };
                return Parser;
            }(BaseParser);
            module.exports = Parser;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/template/parser.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BaseParser, BlockExpression, CollectionExpression, Parser, StringExpression, TokenCodes, Tokenizer, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            Tokenizer = require("paperclip/lib/paper/template/tokenizer.js");
            TokenCodes = Tokenizer.Codes;
            BaseParser = require("paperclip/lib/base/parser.js");
            BlockExpression = require("paperclip/lib/paper/template/expressions/block.js");
            StringExpression = require("paperclip/lib/paper/template/expressions/string.js");
            CollectionExpression = require("paperclip/lib/paper/template/expressions/collection.js");
            Parser = function(_super) {
                __extends(Parser, _super);
                function Parser() {
                    this._t = new Tokenizer;
                }
                Parser.prototype._parse = function() {
                    var expressions;
                    expressions = [];
                    this._nextCode();
                    while (this._t.current) {
                        expressions.push(this._parseExpression());
                    }
                    return new CollectionExpression(expressions);
                };
                Parser.prototype._parseExpression = function() {
                    if (this._currentCode() === TokenCodes.LM) {
                        return this._parseBlock();
                    } else {
                        return this._parseString();
                    }
                };
                Parser.prototype._parseBlock = function() {
                    var buffer, c;
                    buffer = [];
                    this._nextCode();
                    while ((c = this._currentCode()) !== TokenCodes.RM && c) {
                        if (c === TokenCodes.LM) {
                            buffer.push("{{", this._parseBlock().value, "}}");
                        } else {
                            buffer.push(this._currentString());
                        }
                        this._nextCode();
                    }
                    this._nextCode();
                    return new BlockExpression(buffer.join(""));
                };
                Parser.prototype._parseString = function() {
                    var buffer, c;
                    buffer = [ this._currentString() ];
                    this._nextCode();
                    while ((c = this._currentCode()) !== TokenCodes.LM && c) {
                        buffer.push(this._currentString());
                        this._nextCode();
                    }
                    return new StringExpression(buffer.join(""));
                };
                return Parser;
            }(BaseParser);
            module.exports = Parser;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BindDecorator, DecoratorFactory, ElementDecorator, TextDecorator;
            TextDecorator = require("paperclip/lib/paper/dom/decor/text.js");
            ElementDecorator = require("paperclip/lib/paper/dom/decor/element.js");
            BindDecorator = require("paperclip/lib/paper/dom/decor/bind.js");
            DecoratorFactory = function() {
                function DecoratorFactory() {}
                DecoratorFactory.prototype.attach = function(data, element) {
                    var DecoratorClass;
                    if (element.nodeName === "#text") {
                        if (TextDecorator.test(element)) {
                            DecoratorClass = TextDecorator;
                        }
                    } else {
                        if (ElementDecorator.test(element)) {
                            DecoratorClass = ElementDecorator;
                        } else if (BindDecorator.test(element)) {
                            DecoratorClass = BindDecorator;
                        }
                    }
                    if (!DecoratorClass) {
                        return;
                    }
                    return element._paperclipDecorator = new DecoratorClass(data, element);
                };
                return DecoratorFactory;
            }();
            module.exports = DecoratorFactory;
        }).call(this);
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
                    if (!this._disposable) {
                        return;
                    }
                    this._disposable.dispose();
                    return this._disposable = this.binding = this.to = this.property = null;
                };
                _Class.prototype.bothWays = function() {
                    var _this = this;
                    return this._disposable = this.to.bind(this.property).to(function(value) {
                        if (_this.currentValue !== value) {
                            return _this._changeFrom(value);
                        }
                    });
                };
                _Class.prototype._changeFrom = function(value) {
                    var _this = this;
                    return this.__transform("from", value, function(err, transformedValue) {
                        if (err) {
                            throw err;
                        }
                        return _this.binding._from.set(_this.binding._property, _this.currentValue = transformedValue);
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
    define("hoist/lib/transformer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var async, getArrayTypeCaster, getClassTypeCaster, getSimpleDataTypeCaster, getTypeCaster, isa;
            isa = require("isa/isa.js");
            async = require("async/lib/async.js");
            getArrayTypeCaster = function() {
                return function(value) {
                    if (isa.array(value)) {
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
                    if (arguments.length > 1 && isa["function"](arguments[arguments.length - 1])) {
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
    define("sift/sift.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var _convertDotToSubObject = function(keyParts, value) {
                var subObject = {}, currentValue = subObject;
                for (var i = 0, n = keyParts.length - 1; i < n; i++) {
                    currentValue = currentValue[keyParts[i]] = {};
                }
                currentValue[keyParts[i]] = value;
                return subObject;
            };
            var _queryParser = new function() {
                var priority = this.priority = function(statement, data) {
                    var exprs = statement.exprs, priority = 0;
                    for (var i = 0, n = exprs.length; i < n; i++) {
                        var expr = exprs[i], p;
                        if (!~(p = expr.e(expr.v, _comparable(data), data))) return -1;
                        priority += p;
                    }
                    return priority;
                };
                var parse = this.parse = function(statement, key) {
                    if (!statement) statement = {
                        $eq: statement
                    };
                    var testers = [];
                    if (statement.constructor == Object) {
                        for (var k in statement) {
                            var operator = !!_testers[k] ? k : "$trav", value = statement[k], exprValue = value;
                            if (TRAV_OP[operator]) {
                                if (~k.indexOf(".")) {
                                    var keyParts = k.split(".");
                                    k = keyParts.shift();
                                    exprValue = value = _convertDotToSubObject(keyParts, value);
                                }
                                if (value instanceof Array) {
                                    exprValue = [];
                                    for (var i = value.length; i--; ) {
                                        exprValue.push(parse(value[i]));
                                    }
                                } else {
                                    exprValue = parse(value, k);
                                }
                            }
                            testers.push(_getExpr(operator, k, exprValue));
                        }
                    } else {
                        testers.push(_getExpr("$eq", k, statement));
                    }
                    var stmt = {
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
                };
                var TRAV_OP = {
                    $and: true,
                    $or: true,
                    $nor: true,
                    $trav: true,
                    $not: true
                };
                function _comparable(value) {
                    if (value instanceof Date) {
                        return value.getTime();
                    } else {
                        return value;
                    }
                }
                function btop(value) {
                    return value ? 0 : -1;
                }
                var _testers = {
                    $eq: function(a, b) {
                        return btop(a.test(b));
                    },
                    $ne: function(a, b) {
                        return btop(!a.test(b));
                    },
                    $lt: function(a, b) {
                        return btop(a > b);
                    },
                    $gt: function(a, b) {
                        return btop(a < b);
                    },
                    $lte: function(a, b) {
                        return btop(a >= b);
                    },
                    $gte: function(a, b) {
                        return btop(a <= b);
                    },
                    $exists: function(a, b) {
                        return btop(a == !!b);
                    },
                    $in: function(a, b) {
                        if (b instanceof Array) {
                            for (var i = b.length; i--; ) {
                                if (~a.indexOf(b[i])) return i;
                            }
                        } else {
                            return btop(~a.indexOf(b));
                        }
                        return -1;
                    },
                    $not: function(a, b) {
                        if (!a.test) throw new Error("$not test should include an expression, not a value. Use $ne instead.");
                        return btop(!a.test(b));
                    },
                    $type: function(a, b, org) {
                        return org ? btop(org instanceof a || org.constructor == a) : -1;
                    },
                    $nin: function(a, b) {
                        return ~_testers.$in(a, b) ? -1 : 0;
                    },
                    $mod: function(a, b) {
                        return b % a[0] == a[1] ? 0 : -1;
                    },
                    $all: function(a, b) {
                        for (var i = a.length; i--; ) {
                            if (b.indexOf(a[i]) == -1) return -1;
                        }
                        return 0;
                    },
                    $size: function(a, b) {
                        return b ? btop(a == b.length) : -1;
                    },
                    $or: function(a, b) {
                        var i = a.length, p, n = i;
                        for (; i--; ) {
                            if (~priority(a[i], b)) {
                                return i;
                            }
                        }
                        return btop(n == 0);
                    },
                    $nor: function(a, b) {
                        var i = a.length, n = i;
                        for (; i--; ) {
                            if (~priority(a[i], b)) {
                                return -1;
                            }
                        }
                        return 0;
                    },
                    $and: function(a, b) {
                        for (var i = a.length; i--; ) {
                            if (!~priority(a[i], b)) {
                                return -1;
                            }
                        }
                        return 0;
                    },
                    $trav: function(a, b) {
                        if (b instanceof Array) {
                            for (var i = b.length; i--; ) {
                                var subb = b[i];
                                if (subb[a.k] && ~priority(a, subb[a.k])) return i;
                            }
                            return -1;
                        }
                        return b ? priority(a, b[a.k]) : -1;
                    }
                };
                var _prepare = {
                    $eq: function(a) {
                        var fn;
                        if (a instanceof RegExp) {
                            return a;
                        } else if (a instanceof Function) {
                            fn = a;
                        } else {
                            fn = function(b) {
                                if (b instanceof Array) {
                                    return ~b.indexOf(a);
                                } else {
                                    return a == b;
                                }
                            };
                        }
                        return {
                            test: fn
                        };
                    },
                    $ne: function(a) {
                        return _prepare.$eq(a);
                    }
                };
                var _getExpr = function(type, key, value) {
                    var v = _comparable(value);
                    return {
                        k: key,
                        v: _prepare[type] ? _prepare[type](v) : v,
                        e: _testers[type]
                    };
                };
            };
            var getSelector = function(selector) {
                if (!selector) {
                    return function(value) {
                        return value;
                    };
                } else if (typeof selector == "function") {
                    return selector;
                }
                throw new Error("Unknown sift selector " + selector);
            };
            var sifter = function(query, selector) {
                var filter = _queryParser.parse(query);
                var self = function(target) {
                    var sifted = [], results = [], value, priority;
                    for (var i = 0, n = target.length; i < n; i++) {
                        value = selector(target[i]);
                        if (!~(priority = filter.priority(value))) continue;
                        sifted.push({
                            value: value,
                            priority: priority
                        });
                    }
                    sifted.sort(function(a, b) {
                        return a.priority > b.priority ? -1 : 1;
                    });
                    var values = Array(sifted.length);
                    for (var i = sifted.length; i--; ) {
                        values[i] = sifted[i].value;
                    }
                    return values;
                };
                self.test = filter.test;
                self.score = filter.priority;
                self.query = query;
                return self;
            };
            var sift = function(query, target, rawSelector) {
                if (typeof target != "object") {
                    rawSelector = target;
                    target = undefined;
                }
                var sft = sifter(query, getSelector(rawSelector));
                if (target) return sft(target);
                return sft;
            };
            if (typeof module != "undefined" && typeof module.exports != "undefined") {
                module.exports = sift;
            } else if (typeof window != "undefined") {
                window.sift = sift;
            }
        })();
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
    define("paperclip/lib/clip/tokenizer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BaseTokenizer, Codes, Tokenizer, key, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            BaseTokenizer = require("paperclip/lib/base/tokenizer.js");
            Codes = function() {
                function Codes() {}
                Codes.OTHER = -1;
                Codes.WORD = 256;
                Codes.STRING = Codes.WORD + 1;
                Codes.VAR = Codes.STRING + 1;
                Codes.WS = Codes.VAR + 1;
                Codes.NUMBER = Codes.WS + 1;
                Codes.BOOL = Codes.NUMBER + 1;
                Codes.AS = Codes.BOOL + 1;
                Codes.DOLLAR = 36;
                Codes.LP = 40;
                Codes.RP = 41;
                Codes.COMA = 44;
                Codes.DOT = 46;
                Codes.COLON = 58;
                Codes.SEMI_COLON = 59;
                Codes.AT = 64;
                Codes.LB = 123;
                Codes.PIPE = 124;
                Codes.RB = 125;
                Codes.byCodes = {};
                Codes.key = function(code) {
                    var key;
                    for (key in Codes) {
                        if (Codes[key] === code) {
                            return key;
                        }
                    }
                };
                return Codes;
            }();
            for (key in Codes) {
                Codes.byCodes[Codes[key]] = Codes[key];
            }
            Tokenizer = function(_super) {
                __extends(Tokenizer, _super);
                function Tokenizer() {
                    _ref = Tokenizer.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                Tokenizer.prototype.codes = Codes;
                Tokenizer.codes = Codes;
                Tokenizer.prototype._next = function() {
                    var buffer, c, ccode, cscode, word;
                    if (this._s.isAZ() || (ccode = this._s.ccode()) === 36 || ccode === 95 || ccode === 64) {
                        word = this._s.next(/[_$@a-zA-Z0-9]+/);
                        if (/true|false/.test(word)) {
                            return this._t(Codes.BOOL, word);
                        }
                        if (word === "as") {
                            return this._t(Codes.AS, word);
                        }
                        return this._t(Codes.VAR, word);
                    } else if (ccode === 39 || ccode === 34) {
                        this._s.skipWhitespace(false);
                        buffer = [];
                        while ((c = this._s.nextChar()) && !this._s.eof()) {
                            cscode = this._s.ccode();
                            if (cscode === 92) {
                                buffer.push(this._s.nextChar());
                                continue;
                            }
                            if (cscode === ccode) {
                                break;
                            }
                            buffer.push(c);
                        }
                        this._s.skipWhitespace(true);
                        return this._t(Codes.STRING, buffer.join(""));
                    } else if (this._s.is09()) {
                        return this._t(Codes.NUMBER, this._s.nextNumber());
                    } else if (this._s.isWs()) {
                        return this._t(Codes.WS, this._s.next(/[\s\r\n\t]+/));
                    } else if (Codes.byCodes[ccode]) {
                        return this._t(Codes.byCodes[ccode], this._s.cchar());
                    }
                };
                return Tokenizer;
            }(BaseTokenizer);
            module.exports = Tokenizer;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/base/parser.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Parser;
            Parser = function() {
                function Parser(_t) {
                    this._t = _t;
                }
                Parser.prototype.parse = function(source) {
                    this._source = source;
                    this._t.source(source);
                    return this._parse();
                };
                Parser.prototype._parse = function() {};
                Parser.prototype._expectNextCode = function(code) {
                    if (this._t.next()[0] !== code) {
                        return this._error();
                    }
                };
                Parser.prototype._expectCurrentCode = function(code) {
                    if (this._t.current[0] !== code) {
                        return this._error();
                    }
                };
                Parser.prototype._nextCode = function() {
                    var _ref;
                    return (_ref = this._t.next()) != null ? _ref[0] : void 0;
                };
                Parser.prototype._currentCode = function() {
                    var _ref;
                    return (_ref = this._t.current) != null ? _ref[0] : void 0;
                };
                Parser.prototype._currentString = function() {
                    var _ref;
                    return (_ref = this._t.current) != null ? _ref[1] : void 0;
                };
                Parser.prototype._error = function() {
                    throw new Error('unexpected token in "' + this._source + '"');
                };
                return Parser;
            }();
            module.exports = Parser;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/modifier.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var ModifierExpression, base, modifiers, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            modifiers = require("paperclip/lib/clip/modifiers/index.js");
            ModifierExpression = function(_super) {
                __extends(ModifierExpression, _super);
                ModifierExpression.prototype._type = "modifier";
                function ModifierExpression(name, params, expression) {
                    this.name = name;
                    this.params = params;
                    this.expression = expression;
                    ModifierExpression.__super__.constructor.call(this);
                    this.addChild(this.params, this.expression);
                }
                ModifierExpression.prototype.toString = function() {
                    var buffer, p, params, _i, _len, _ref;
                    buffer = [ "this.modify(" ];
                    if (modifiers[this.name]) {
                        buffer.push("this.defaultModifiers.");
                    } else {
                        buffer.push("this.modifiers.");
                    }
                    buffer.push("" + this.name + ", [");
                    this.expression.noValue = true;
                    params = [ this.expression.toString() ];
                    _ref = this.params.items;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        p = _ref[_i];
                        params.push(p.toString());
                    }
                    buffer.push(params.join(","), "])");
                    return buffer.join("");
                };
                return ModifierExpression;
            }(base.Expression);
            module.exports = ModifierExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/script.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var ScriptExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            ScriptExpression = function(_super) {
                __extends(ScriptExpression, _super);
                ScriptExpression.prototype._type = "script";
                function ScriptExpression(expressions) {
                    this.expressions = expressions;
                    ScriptExpression.__super__.constructor.call(this);
                    this.addChild(this.expressions);
                }
                ScriptExpression.prototype.toString = function() {
                    return this.expressions.toString();
                };
                return ScriptExpression;
            }(base.Expression);
            module.exports = ScriptExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/action.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var ActionExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            ActionExpression = function(_super) {
                __extends(ActionExpression, _super);
                ActionExpression.prototype._type = "action";
                function ActionExpression(name, options) {
                    this.name = name;
                    this.options = options;
                    ActionExpression.__super__.constructor.call(this);
                }
                ActionExpression.prototype.references = function() {
                    return this.options.references();
                };
                ActionExpression.prototype.toString = function() {
                    var buffer;
                    buffer = [ "{" ];
                    buffer.push("name:'" + this.name + "', ");
                    buffer.push("value:" + this.options.toString());
                    buffer.push("}");
                    return buffer.join("");
                };
                return ActionExpression;
            }(base.Expression);
            module.exports = ActionExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/actions.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var ActionsExpression, CollectionExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            CollectionExpression = require("paperclip/lib/base/collectionExpression.js");
            ActionsExpression = function(_super) {
                __extends(ActionsExpression, _super);
                ActionsExpression.prototype._type = "actions";
                function ActionsExpression(items) {
                    ActionsExpression.__super__.constructor.call(this, items);
                    this.actions = items;
                }
                ActionsExpression.prototype.toString = function() {
                    var action, actions, buffer, _i, _len, _ref;
                    buffer = [ "[" ];
                    actions = [];
                    _ref = this.actions;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        action = _ref[_i];
                        actions.push(action.toString());
                    }
                    buffer.push(actions.join(","));
                    buffer.push("]");
                    return buffer.join("");
                };
                return ActionsExpression;
            }(CollectionExpression);
            module.exports = ActionsExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/options.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var OptionsExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            OptionsExpression = function(_super) {
                __extends(OptionsExpression, _super);
                OptionsExpression.prototype._type = "options";
                function OptionsExpression(items) {
                    this.items = items;
                    OptionsExpression.__super__.constructor.call(this);
                    this.addChild(items);
                }
                return OptionsExpression;
            }(base.Expression);
            module.exports = OptionsExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/ref.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var RefExpression;
            RefExpression = function() {
                RefExpression.prototype._type = "ref";
                function RefExpression(name) {
                    if (name.substr(0, 1) === "@") {
                        this.self = true;
                        this.name = name.substr(1);
                    } else {
                        this.name = name;
                    }
                }
                RefExpression.prototype.toString = function() {
                    return this.name;
                };
                return RefExpression;
            }();
            module.exports = RefExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/refPath.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var CollectionExpression, RefPathExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            CollectionExpression = require("paperclip/lib/base/collectionExpression.js");
            RefPathExpression = function(_super) {
                __extends(RefPathExpression, _super);
                RefPathExpression.prototype._type = "refPath";
                function RefPathExpression(items, castAs) {
                    this.castAs = castAs;
                    RefPathExpression.__super__.constructor.call(this, items);
                }
                RefPathExpression.prototype.references = function() {
                    var refs;
                    refs = RefPathExpression.__super__.references.call(this);
                    refs.push(this);
                    return refs;
                };
                RefPathExpression.prototype.toString = function() {
                    var buffer, currentChain, part, self, _i, _len, _ref;
                    buffer = [ "this" ];
                    currentChain = [];
                    self = false;
                    if (this.castAs) {
                        buffer.push(".castAs('" + this.castAs + "')");
                    }
                    _ref = this.items;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        part = _ref[_i];
                        if (part._type === "fn") {
                            this._pushRef(buffer, currentChain, self);
                            buffer.push(".call('", part.name, "', [");
                            buffer.push(part.params.toString(), "])");
                            currentChain = [];
                            self = false;
                        } else {
                            currentChain.push(part.name);
                            self = self || part.self;
                        }
                    }
                    this._pushRef(buffer, currentChain, self);
                    if (!this.noValue) {
                        buffer.push(".value()");
                    }
                    return buffer.join("");
                };
                RefPathExpression.prototype._pushRef = function(buffer, chain, self) {
                    var command;
                    if (chain.length) {
                        command = self ? "self" : "ref";
                        return buffer.push("." + command + "('", chain.join("."), "')");
                    }
                };
                return RefPathExpression;
            }(CollectionExpression);
            module.exports = RefPathExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/fn.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var FnExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            FnExpression = function(_super) {
                __extends(FnExpression, _super);
                FnExpression.prototype._type = "fn";
                function FnExpression(name, params) {
                    this.name = name;
                    this.params = params;
                    FnExpression.__super__.constructor.call(this);
                    this.addChild(this.params);
                }
                return FnExpression;
            }(base.Expression);
            module.exports = FnExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/js.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var JSExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            JSExpression = function(_super) {
                __extends(JSExpression, _super);
                JSExpression.prototype._type = "js";
                function JSExpression(value) {
                    this.value = value;
                    JSExpression.__super__.constructor.call(this);
                }
                JSExpression.prototype.toString = function() {
                    return this.value;
                };
                return JSExpression;
            }(base.Expression);
            module.exports = JSExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/params.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var CollectionExpression, ParamsExpression, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            CollectionExpression = require("paperclip/lib/base/collectionExpression.js");
            ParamsExpression = function(_super) {
                __extends(ParamsExpression, _super);
                function ParamsExpression() {
                    _ref = ParamsExpression.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                ParamsExpression.prototype._type = "params";
                ParamsExpression.prototype.toString = function() {
                    return this.items.map(function(item) {
                        return item.toString();
                    }).join(",");
                };
                return ParamsExpression;
            }(CollectionExpression);
            module.exports = ParamsExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/base/collectionExpression.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var CollectionExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            CollectionExpression = function(_super) {
                __extends(CollectionExpression, _super);
                CollectionExpression.prototype._type = "collection";
                function CollectionExpression(items) {
                    this.items = items;
                    CollectionExpression.__super__.constructor.call(this);
                    this.addChild.apply(this, this.items);
                }
                CollectionExpression.prototype.toString = function() {
                    return this.items.map(function(item) {
                        return item.toString();
                    }).join("");
                };
                return CollectionExpression;
            }(base.Expression);
            module.exports = CollectionExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/string.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var StringExpression, base;
            base = require("paperclip/lib/base/expression.js");
            StringExpression = function() {
                StringExpression.prototype._type = "string";
                function StringExpression(value) {
                    this.value = value;
                }
                StringExpression.prototype.toString = function() {
                    return "'" + this.value.replace(/\'/g, "\\'").replace(/\n/g, "\\n") + "'";
                };
                return StringExpression;
            }();
            module.exports = StringExpression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/clip/expressions/group.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var GroupExpresion, ParamsExpression, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            ParamsExpression = require("paperclip/lib/clip/expressions/params.js");
            GroupExpresion = function(_super) {
                __extends(GroupExpresion, _super);
                function GroupExpresion() {
                    _ref = GroupExpresion.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                GroupExpresion.prototype._type = "group";
                GroupExpresion.prototype.toString = function() {
                    return "(" + GroupExpresion.__super__.toString.call(this) + ")";
                };
                return GroupExpresion;
            }(ParamsExpression);
            module.exports = GroupExpresion;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/template/tokenizer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var BaseTokenizer, Codes, Tokenizer, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            BaseTokenizer = require("paperclip/lib/base/tokenizer.js");
            Codes = function() {
                function Codes() {}
                Codes.OTHER = -1;
                Codes.LM = 1;
                Codes.RM = Codes.LM + 1;
                Codes.CHAR = Codes.RM + 1;
                return Codes;
            }();
            Tokenizer = function(_super) {
                __extends(Tokenizer, _super);
                function Tokenizer() {
                    Tokenizer.__super__.constructor.call(this);
                    this._s.skipWhitespace(false);
                }
                Tokenizer.Codes = Codes;
                Tokenizer.prototype._next = function() {
                    var ccode;
                    if ((ccode = this._s.cchar()) === "{") {
                        if (this._s.peek(1) === "{") {
                            this._s.nextChar();
                            return this._t(Codes.LM, "{{");
                        }
                    } else if ((ccode = this._s.cchar()) === "}") {
                        if (this._s.peek(1) === "}") {
                            this._s.nextChar();
                            return this._t(Codes.RM, "}}");
                        }
                    }
                    return this._t(Codes.CHAR, this._s.cchar());
                };
                return Tokenizer;
            }(BaseTokenizer);
            module.exports = Tokenizer;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/template/expressions/block.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Clip, Expression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            Clip = require("paperclip/lib/clip/index.js");
            Expression = function(_super) {
                __extends(Expression, _super);
                Expression.prototype._type = "block";
                function Expression(value) {
                    this.value = value;
                }
                Expression.prototype.toString = function() {
                    return "pushBinding(" + Clip.compile(this.value.toString()) + ")";
                };
                return Expression;
            }(base.Expression);
            module.exports = Expression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/template/expressions/string.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Expression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            base = require("paperclip/lib/base/expression.js");
            Expression = function(_super) {
                __extends(Expression, _super);
                Expression.prototype._type = "string";
                function Expression(value) {
                    this.value = value;
                }
                Expression.prototype.toString = function() {
                    return "push('" + this.value.replace(/\'/g, "\\'").replace(/\n/g, "\\n") + "')";
                };
                return Expression;
            }(base.Expression);
            module.exports = Expression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/template/expressions/collection.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var CollectionExpression, Expression, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
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
            CollectionExpression = require("paperclip/lib/base/collectionExpression.js");
            Expression = function(_super) {
                __extends(Expression, _super);
                function Expression() {
                    _ref = Expression.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                Expression.prototype.toString = function() {
                    var command, item, _i, _len, _ref1;
                    command = [ "this" ];
                    _ref1 = this.items;
                    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                        item = _ref1[_i];
                        command.push(item.toString());
                    }
                    return command.join(".");
                };
                return Expression;
            }(CollectionExpression);
            module.exports = Expression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/text.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Decorator, Template, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            Template = require("paperclip/lib/paper/template/index.js");
            Decorator = function() {
                function Decorator(data, element) {
                    this.data = data;
                    this.element = element;
                    this._change = __bind(this._change, this);
                    this._template = new Template(this.element.nodeValue);
                    this._renderer = this._template.render(this.data);
                }
                Decorator.prototype.init = function() {
                    return this._renderer.bind("text").to(this._change);
                };
                Decorator.prototype._change = function(value) {
                    return this.element.nodeValue = value;
                };
                Decorator.test = function(element) {
                    return !!~element.nodeValue.indexOf("{{");
                };
                return Decorator;
            }();
            module.exports = Decorator;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/element.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var AttributeBinding, Decorator, Template, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            };
            Template = require("paperclip/lib/paper/template/index.js");
            AttributeBinding = function() {
                function AttributeBinding(data, attribute, element) {
                    this.data = data;
                    this.attribute = attribute;
                    this.element = element;
                    this._elementChange = __bind(this._elementChange, this);
                    this._change = __bind(this._change, this);
                    this.name = attribute.name;
                    this._template = new Template(this.attribute.value);
                    this._renderer = this._template.render(this.data);
                }
                AttributeBinding.prototype.init = function() {
                    this._renderer.bind("text").to(this._change);
                    return $(element).bind("mouseup keydown keyup change", this._elementChange);
                };
                AttributeBinding.prototype._change = function(value) {
                    return this.attribute.value = this.currentValue = value;
                };
                AttributeBinding.prototype._elementChange = function(event) {
                    var key, refs, refsByKey, value, _i, _len, _results;
                    if (this.name === "value") {
                        value = this.element.value;
                    } else {
                        value = this.attribute.value;
                    }
                    if (this.currentValue !== value && (refs = this._bothWays()).length) {
                        _results = [];
                        for (_i = 0, _len = refs.length; _i < _len; _i++) {
                            refsByKey = refs[_i];
                            _results.push(function() {
                                var _results1;
                                _results1 = [];
                                for (key in refsByKey) {
                                    _results1.push(refsByKey[key].value(value));
                                }
                                return _results1;
                            }());
                        }
                        return _results;
                    }
                };
                AttributeBinding.prototype._bothWays = function() {
                    var binding, refs, _i, _len, _ref;
                    refs = [];
                    _ref = this._renderer.bindings;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        binding = _ref[_i];
                        if (binding.clip.options.bothWays) {
                            refs.push(binding.clip.options.bothWays);
                        }
                    }
                    return refs;
                };
                return AttributeBinding;
            }();
            Decorator = function() {
                function Decorator(data, element) {
                    var attr, _i, _len, _ref;
                    this.data = data;
                    this.element = element;
                    this._bindings = [];
                    _ref = this.element.attributes;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        attr = _ref[_i];
                        if (!!~String(attr.value).indexOf("{{")) {
                            this._bindings.push(new AttributeBinding(this.data, attr, this.element));
                        }
                    }
                }
                Decorator.test = function(element) {
                    var attr, _i, _len, _ref;
                    _ref = element.attributes;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        attr = _ref[_i];
                        if (!!~String(attr.value).indexOf("{{")) {
                            return true;
                        }
                    }
                    return false;
                };
                return Decorator;
            }();
            module.exports = Decorator;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/bind.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Clip, Decorator, Template, handlers;
            Template = require("paperclip/lib/paper/template/index.js");
            Clip = require("paperclip/lib/clip/index.js");
            handlers = require("paperclip/lib/paper/dom/decor/handlers/index.js");
            Decorator = function() {
                function Decorator(data, element) {
                    var action, clazz, handler, _i, _len, _ref;
                    this.data = data;
                    this.element = element;
                    this._clip = new Clip({
                        script: Clip.compile(this._dataBind(element)),
                        data: this.data
                    });
                    this._handlers = [];
                    _ref = this._clip.watchers.names;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        action = _ref[_i];
                        if (handlers[action]) {
                            clazz = handlers[action];
                            this._handlers.push(handler = new clazz(this._clip.watcher(action), this._clip, element));
                            this.traverse = handler.traverse !== false;
                        }
                    }
                }
                Decorator.prototype.init = function() {
                    var handler, _i, _len, _ref, _results;
                    _ref = this._handlers;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        handler = _ref[_i];
                        handler.dom = this.dom;
                        _results.push(handler.init());
                    }
                    return _results;
                };
                Decorator.prototype._dataBind = function(element) {
                    var attr, _i, _len, _ref;
                    _ref = element.attributes;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        attr = _ref[_i];
                        if (attr.name === "data-bind") {
                            return attr.value;
                        }
                    }
                };
                Decorator.test = function(element) {
                    var attr, _i, _len, _ref;
                    _ref = element.attributes;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        attr = _ref[_i];
                        if (attr.name === "data-bind") {
                            return true;
                        }
                    }
                    return false;
                };
                return Decorator;
            }();
            module.exports = Decorator;
        }).call(this);
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
                    this.init();
                }
                _Class.prototype.init = function() {
                    var _this = this;
                    return this._setValue(this.binding._from.get(this.binding._property), function(value) {
                        if (!_this.binding.watch()) {
                            return _this._change(value);
                        }
                    });
                };
                _Class.prototype.change = function(value) {
                    var _this = this;
                    return this._setValue(value, function(value) {
                        return _this._change(value);
                    });
                };
                _Class.prototype._setValue = function(value, callback) {
                    var _this = this;
                    if (this.currentValue === value) {
                        return false;
                    }
                    this.__transform("to", value, function(err, transformedValue) {
                        if (err) {
                            throw err;
                        }
                        return callback(_this.currentValue = transformedValue);
                    });
                    return true;
                };
                _Class.prototype.bothWays = function() {};
                _Class.prototype._change = function(value) {};
                _Class.prototype.__transform = function(method, value, next) {
                    return utils.tryTransform(this._transformer, method, value, next);
                };
                return _Class;
            }();
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
                } else {
                    async.nextTick = function(fn) {
                        setTimeout(fn, 0);
                    };
                }
            } else {
                async.nextTick = process.nextTick;
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
                    var sync = true;
                    iterator(arr[completed], function(err) {
                        if (err) {
                            callback(err);
                            callback = function() {};
                        } else {
                            completed += 1;
                            if (completed >= arr.length) {
                                callback(null);
                            } else {
                                if (sync) {
                                    async.nextTick(iterate);
                                } else {
                                    iterate();
                                }
                            }
                        }
                    });
                    sync = false;
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
                            async.nextTick(taskComplete);
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
                            async.nextTick(function() {
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
                    var sync = true;
                    iterator(function(err) {
                        if (err) {
                            return callback(err);
                        }
                        if (sync) {
                            async.nextTick(function() {
                                async.whilst(test, iterator, callback);
                            });
                        } else {
                            async.whilst(test, iterator, callback);
                        }
                    });
                    sync = false;
                } else {
                    callback();
                }
            };
            async.doWhilst = function(iterator, test, callback) {
                var sync = true;
                iterator(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    if (test()) {
                        if (sync) {
                            async.nextTick(function() {
                                async.doWhilst(iterator, test, callback);
                            });
                        } else {
                            async.doWhilst(iterator, test, callback);
                        }
                    } else {
                        callback();
                    }
                });
                sync = false;
            };
            async.until = function(test, iterator, callback) {
                if (!test()) {
                    var sync = true;
                    iterator(function(err) {
                        if (err) {
                            return callback(err);
                        }
                        if (sync) {
                            async.nextTick(function() {
                                async.until(test, iterator, callback);
                            });
                        } else {
                            async.until(test, iterator, callback);
                        }
                    });
                    sync = false;
                } else {
                    callback();
                }
            };
            async.doUntil = function(iterator, test, callback) {
                var sync = true;
                iterator(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    if (!test()) {
                        if (sync) {
                            async.nextTick(function() {
                                async.doUntil(iterator, test, callback);
                            });
                        } else {
                            async.doUntil(iterator, test, callback);
                        }
                    } else {
                        callback();
                    }
                });
                sync = false;
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
                        async.nextTick(q.process);
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
                            var sync = true;
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
                            var cb = only_once(function() {
                                var cbArgs = arguments;
                                if (sync) {
                                    async.nextTick(function() {
                                        next.apply(null, cbArgs);
                                    });
                                } else {
                                    next.apply(null, arguments);
                                }
                            });
                            worker(task.data, cb);
                            sync = false;
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
                        async.nextTick(cargo.process);
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
            async.applyEach = function(fns) {
                var go = function() {
                    var that = this;
                    var args = Array.prototype.slice.call(arguments);
                    var callback = args.pop();
                    return async.each(fns, function(fn, cb) {
                        fn.apply(that, args.concat([ cb ]));
                    }, callback);
                };
                if (arguments.length > 1) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    return go.apply(this, args);
                } else {
                    return go;
                }
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
                    var i, item, _i, _len, _ref1, _results;
                    _Class.__super__.init.call(this);
                    _ref1 = this.binding._from.source();
                    _results = [];
                    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
                        item = _ref1[i];
                        _results.push(this.change("insert", item));
                    }
                    return _results;
                };
                _Class.prototype._change = function(method, item) {
                    return this.target(method, item);
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
                        update: function(item) {}
                    });
                    return this._setter = new FnSetter(this.binding, function(method, item, index) {
                        return _this.target[method].call(_this.target, item, index);
                    });
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
                        update: function(item, index) {
                            return _this.target.update(item);
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
    define("paperclip/lib/base/tokenizer.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Tokenizer, strscan;
            strscan = require("strscanner/lib/index.js");
            Tokenizer = function() {
                function Tokenizer() {
                    this._s = strscan("", {
                        skipWhitespace: true
                    });
                    this._pool = [];
                }
                Tokenizer.prototype.peekNext = function() {
                    var c, next;
                    c = this.current;
                    next = this.next();
                    this.putBack();
                    this.current = c;
                    return next;
                };
                Tokenizer.prototype.source = function(value) {
                    if (!arguments.length) {
                        return this._source;
                    }
                    this._s.source(this._source = value);
                    return this;
                };
                Tokenizer.prototype.putBack = function() {
                    if (this.current) {
                        return this._pool.push(this.current);
                    }
                };
                Tokenizer.prototype.next = function() {
                    if (this._pool.length) {
                        return this.current = this._pool.pop();
                    }
                    if (this._s.eof()) {
                        return this.current = null;
                    }
                    return this._next() || this._t(-1, this._s.cchar());
                };
                Tokenizer.prototype._next = function() {};
                Tokenizer.prototype._t = function(code, value) {
                    var p;
                    p = this._s.pos();
                    this._s.nextChar();
                    return this.current = [ code, value, p ];
                };
                return Tokenizer;
            }();
            module.exports = Tokenizer;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/base/expression.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Expression;
            Expression = function() {
                function Expression() {
                    this._children = [];
                }
                Expression.prototype.addChild = function() {
                    var child, _i, _len, _results;
                    _results = [];
                    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
                        child = arguments[_i];
                        child._parent = this;
                        _results.push(this._children.push(child));
                    }
                    return _results;
                };
                return Expression;
            }();
            exports.Expression = Expression;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/handlers/index.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            module.exports = {
                each: require("paperclip/lib/paper/dom/decor/handlers/each.js"),
                click: require("paperclip/lib/paper/dom/decor/handlers/click.js"),
                enter: require("paperclip/lib/paper/dom/decor/handlers/enter.js"),
                value: require("paperclip/lib/paper/dom/decor/handlers/value.js")
            };
        }).call(this);
        return module.exports;
    });
    define("bindable/lib/collection/setters/base.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var utils;
            utils = require("bindable/lib/core/utils.js");
            module.exports = function() {
                function _Class(binding, target) {
                    this.binding = binding;
                    this.target = target;
                    this._transformer = binding.transform();
                    this._filter = binding.filter();
                    this.init();
                }
                _Class.prototype.init = function() {};
                _Class.prototype.dispose = function() {};
                _Class.prototype.change = function(event, item) {
                    var _this = this;
                    if (this._filter) {
                        if (!this._filter.test(item)) {
                            return;
                        }
                    }
                    return this.__transform("to", item, function(err, item) {
                        if (err) {
                            throw err;
                        }
                        return _this._change(event, item);
                    });
                };
                _Class.prototype._change = function(event, item) {};
                _Class.prototype.bothWays = function() {};
                _Class.prototype.__transform = function(method, value, next) {
                    return utils.tryTransform(this._transformer, method, value, next);
                };
                return _Class;
            }();
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
    define("strscanner/lib/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = function(source, options) {
            if (!options) {
                options = {
                    skipWhitespace: true
                };
            }
            var _cchar = "", _ccode = 0, _pos = 0, _len = 0, _src = source;
            var self = {
                source: function(value) {
                    _src = value;
                    _len = value.length;
                    self.pos(0);
                },
                skipWhitespace: function(value) {
                    if (!arguments.length) {
                        return options.skipWhitespace;
                    }
                    options.skipWhitespace = value;
                },
                eof: function() {
                    return _pos >= _len;
                },
                pos: function(value) {
                    if (!arguments.length) return _pos;
                    _pos = value;
                    _cchar = _src.charAt(value);
                    _ccode = _cchar.charCodeAt(0);
                },
                skip: function(count) {
                    _pos = Math.min(_pos + count, _len);
                    return _pos;
                },
                rewind: function(count) {
                    _pos = Math.max(_pos - count || 1, 0);
                    return _pos;
                },
                peek: function(count) {
                    return _src.substr(_pos, count || 1);
                },
                nextChar: function() {
                    self.pos(_pos + 1);
                    if (options.skipWhitespace) {
                        if (self.isWs()) {
                            self.nextChar();
                        }
                    }
                    return _cchar;
                },
                cchar: function() {
                    return _cchar;
                },
                ccode: function() {
                    return _ccode;
                },
                isAZ: function() {
                    return _ccode > 64 && _ccode < 91 || _ccode > 96 && _ccode < 123;
                },
                is09: function() {
                    return _ccode > 47 && _ccode < 58;
                },
                isWs: function() {
                    return _ccode === 9 || _ccode === 10 || _ccode === 13 || _ccode === 32;
                },
                isAlpha: function() {
                    return self.isAZ() || self.is09();
                },
                matches: function(search) {
                    return !!_src.substr(_pos).match(search);
                },
                next: function(search) {
                    var buffer = _src.substr(_pos), match = buffer.match(search);
                    _pos += match.index + Math.max(0, match[0].length - 1);
                    return match[0];
                },
                nextWord: function() {
                    if (self.isAZ()) return self.next(/[a-zA-Z]+/);
                },
                nextNumber: function() {
                    if (self.is09()) return self.next(/[0-9]+/);
                },
                nextAlpha: function() {
                    if (self.isAlpha()) return self.next(/[a-zA-Z0-9]+/);
                },
                nextNonAlpha: function() {
                    if (!self.isAlpha()) return self.next(/[^a-zA-Z0-9]+/);
                },
                nextWs: function() {
                    if (self.isWs()) return self.next(/[\s\r\n\t]+/);
                },
                nextUntil: function(match) {
                    var buffer = "";
                    while (!self.eof() && !_cchar.match(match)) {
                        buffer += _cchar;
                        self.nextChar();
                    }
                    return buffer;
                },
                to: function(count) {
                    var buffer = _src.substr(_pos, count);
                    _pos += count;
                    return buffer;
                }
            };
            self.source(source);
            return self;
        };
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/handlers/each.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Element, Handler, bindable, _ref, __bind = function(fn, me) {
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
            Element = function() {
                function Element(el, item, idKey, value) {
                    this.el = el;
                    this.item = item;
                    this[idKey] = value;
                }
                return Element;
            }();
            Handler = function(_super) {
                __extends(Handler, _super);
                function Handler() {
                    this._removeElement = __bind(this._removeElement, this);
                    this._insertElement = __bind(this._insertElement, this);
                    this._change = __bind(this._change, this);
                    _ref = Handler.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                Handler.prototype.traverse = false;
                Handler.prototype.init = function() {
                    this.$element = $(this.element);
                    this.tpl = this.$element.html();
                    this.$element.html("");
                    this._source = new bindable.Collection;
                    this._watchSource();
                    this.clip.bind("each").to(this._change);
                    return this.watcher.watch();
                };
                Handler.prototype._change = function(value) {
                    return this._source.reset(value);
                };
                Handler.prototype._watchSource = function() {
                    var _this = this;
                    this._source.transform().map(function(item) {
                        var el;
                        el = $("<div>" + _this.tpl + "</div>");
                        return new Element(el, {
                            item: item
                        }, _this._source._id(), item[_this._source._id()]);
                    });
                    return this._source.bind({
                        insert: this._insertElement,
                        remove: this._removeElement
                    });
                };
                Handler.prototype._insertElement = function(element) {
                    this.$element.append(element.el);
                    return this.dom.attach(element.item, element.el);
                };
                Handler.prototype._removeElement = function(element) {
                    return element.el.remove();
                };
                return Handler;
            }(require("paperclip/lib/paper/dom/decor/handlers/base.js"));
            module.exports = Handler;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/handlers/click.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Handler, _ref, __bind = function(fn, me) {
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
            Handler = function(_super) {
                __extends(Handler, _super);
                function Handler() {
                    this._onClicked = __bind(this._onClicked, this);
                    _ref = Handler.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                Handler.prototype.init = function() {
                    return $(this.element).bind("click", this._onClicked);
                };
                Handler.prototype._onClicked = function(event) {
                    return this.watcher.update();
                };
                return Handler;
            }(require("paperclip/lib/paper/dom/decor/handlers/base.js"));
            module.exports = Handler;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/handlers/enter.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Handler, _ref, __bind = function(fn, me) {
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
            Handler = function(_super) {
                __extends(Handler, _super);
                function Handler() {
                    this._onKeyUp = __bind(this._onKeyUp, this);
                    _ref = Handler.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                Handler.prototype.init = function() {
                    return $(this.element).bind("keyup", this._onKeyUp);
                };
                Handler.prototype._onKeyUp = function(event) {
                    if (event.keyCode !== 13) {
                        return;
                    }
                    return this.watcher.update();
                };
                return Handler;
            }(require("paperclip/lib/paper/dom/decor/handlers/base.js"));
            module.exports = Handler;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/handlers/value.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Handler, _ref, __bind = function(fn, me) {
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
            Handler = function(_super) {
                __extends(Handler, _super);
                function Handler() {
                    this._onElementChange = __bind(this._onElementChange, this);
                    this._onValueChange = __bind(this._onValueChange, this);
                    _ref = Handler.__super__.constructor.apply(this, arguments);
                    return _ref;
                }
                Handler.prototype.init = function() {
                    this.watcher.watch();
                    this.clip.bind("value").to(this._onValueChange);
                    return $(this.element).bind("keyup change", this._onElementChange);
                };
                Handler.prototype._onValueChange = function(value) {
                    return this.element.value = this.currentValue = value;
                };
                Handler.prototype._onElementChange = function(event) {
                    var key, refs, refsByKey, value, _i, _len, _results;
                    value = this.element.value;
                    if (this.currentValue !== value && (refs = this._bothWays()).length) {
                        _results = [];
                        for (_i = 0, _len = refs.length; _i < _len; _i++) {
                            refsByKey = refs[_i];
                            _results.push(function() {
                                var _results1;
                                _results1 = [];
                                for (key in refsByKey) {
                                    _results1.push(refsByKey[key].value(value));
                                }
                                return _results1;
                            }());
                        }
                        return _results;
                    }
                };
                Handler.prototype._bothWays = function() {
                    var refs;
                    refs = [];
                    if (this.clip.options.bothWays) {
                        refs.push(this.clip.options.bothWays);
                    }
                    return refs;
                };
                return Handler;
            }(require("paperclip/lib/paper/dom/decor/handlers/base.js"));
            module.exports = Handler;
        }).call(this);
        return module.exports;
    });
    define("paperclip/lib/paper/dom/decor/handlers/base.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var Handler;
            Handler = function() {
                function Handler(watcher, clip, element) {
                    this.watcher = watcher;
                    this.clip = clip;
                    this.element = element;
                }
                Handler.prototype.init = function() {};
                return Handler;
            }();
            module.exports = Handler;
        }).call(this);
        return module.exports;
    });
    var entries = [ "paperclip/lib/index.js" ];
    for (var i = entries.length; i--; ) {
        _require(entries[i]);
    }
})();