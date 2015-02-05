var protoclass = require("protoclass");

function BaseScope (context, parent) {
  this.context = context;
  this.parent  = parent;
  this.watcher = this;
}

/**
 */

module.exports = protoclass(BaseScope, {
  __isScope: true,
  get: function (path) {
    // override me
  },
  set: function (path, value) {
    // override me
  },
  watch: function (path, listener) {
    return this.watcher.watchProperty(this.context, path, listener);
  },
  watchProperty: function (target, path, listener) {
    // override me
  },
  watchCollection: function (target, operation, listener) {
    // override me
  },
  child: function (context) {
    // override me
  },
  dispose: function () {
    
  }
});

