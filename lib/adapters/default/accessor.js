var extend       = require("xtend/mutable");

function POJOAccessor() {
  this._getters  = {};
  this._callers  = {};
  this._watchers = [];
}

function _set(target, keypath, value) {

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
}

extend(POJOAccessor.prototype, {

  /**
   */

  call: function(object, keypath, params) {

    var caller;

    if (!(caller = this._callers[keypath])) {
      var ctxPath = ["this"].concat(keypath.split("."));
      ctxPath.pop();
      ctxPath = ctxPath.join(".");
      caller = this._callers[keypath] = new Function("params", "return this." + keypath + ".apply(" + ctxPath + ", params);");
    }

    try {
      var ret = caller.call(object, params);
      this.applyChanges(object);
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

    this.applyChanges(object);

    return ret;
  },

  /**
   */

  watch: function(object, listener) {

    var self = this;
    var currentValue;
    var firstCall = true;

    return this._addWatcher(function(changedObject) {
      if (changedObject === object) listener();
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

  applyChanges: function(object) {
    for (var i = 0, n = this._watchers.length; i < n; i++) {
      this._watchers[i].apply(object);
    }
  }
});

/**
 */

module.exports = POJOAccessor;
