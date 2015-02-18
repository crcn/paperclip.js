var BaseAccessor = require("./base");
var _set         = require("../utils/set");

function POJOAccessor() {
  BaseAccessor.call(this);
  this._getters  = {};
  this._watchers = [];
}

module.exports = BaseAccessor.extend(POJOAccessor, {

  /**
   */

  castObject: function(object) { return object; },

  /**
   */

  call: function(object, path, params) {

    if (typeof path === "string") path = path.split(".");

    var fnName = path.pop();
    var fnCtx  = path.length ? this.get(object, path) : object;
    var fn     = fnCtx[fnName];

    if (!fn) return;
    var ret = fn.apply(fnCtx, params);
    this.applyChanges();
    return ret;
  },

  /**
   */

  get: function(object, path) {

    if (typeof path === "string") path = path.split(".");

    var pt = path.join(".");
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
   * TODO - deserialize is improper. Maybe use
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

  applyChanges: function () {

    for (var i = 0, n = this._watchers.length; i < n; i++) {
      this._watchers[i].apply();
    }
  }
});
