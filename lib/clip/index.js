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

  call: function (path, key, params) {

    // TODO - this doesn't look right...
    var ctx, fn;

    if (arguments.length === 2) {
      params = key;
      ctx = this.__context;
      fn = ctx.get(path);
    } else {
      ctx = this.__context.get(path);
      fn = this.__context.get(path.join(".") + "." + key);
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