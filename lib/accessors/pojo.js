var BaseAccessor = require("./base");

module.exports = BaseAccessor.extend({

  /**
   */

  _getters: {},

  /**
   */

  _setters: {},

  /**
   */

  _watchers: [],

  /**
   */

  castObject: function(object) { return object; },

  /**
   */

  call: function(object, path, params) {

    var fnName = path.pop(),
    fnCtx      = path.length ? this.get(object, path) : object;

    if (!fnCtx) return;
    return fnCtx[fnName].call(fnCtx, params);
  },

  /**
   */

  get: function(object, path) {

    var pt = path.join("."), getter;
    if (!(getter = this._getters[pt])) {
      getter = this._getters[pt] = new Function("return this." +pt);
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
    var pt = path.join("."), setter;
    if (!(setter = this._setters[pt])) {
      setter = this._setters[pt] = new Function("value", "return this." +pt+"=value");
    }

    var ret;
    // is undefined - fugly, but works for this test.
    try {
      ret = setter.call(object, value);
    } catch (e) {
      return void 0;
    }

    this.apply();

    return ret;
  },

  /**
   */

  watchProperty: function(object, path, listener) {
    
    var self = this;
    var watcher = {
      context: object,
      apply: function() {
        var newValue = self.get(object, path);
        if (newValue === this.currentValue && typeof newValue !== "function") return;
        var oldValue = this.currentValue;
        this.currentValue = newValue;
        listener(newValue, this.currentValue);
      }
    };
    
    this._watchers.push(watcher);
    
    return {
      trigger: function(){
        watcher.apply();
      },
      dispose: function() {
        var i = self._watchers.indexOf(watcher);
        if (~i) self._watchers.splice(i, 1);
      }
    };
  },

  /**
   */

  watchEvent: function(object, event, listener) {
    // do nothing
    return {
      dispose: function(){}
    };
  },

  /**
   * TODO - deserialize is improper. Maybe use
   * 
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
   */

  apply: function() {
    for (var i = 0, n = this._watchers.length; i < n; i++) {
      this._watchers[i].apply();
    }
  }
});