var protoclass = require("protoclass");

/**
 */

function BaseAccessor () {
  this.context = context;
}

/**
 */

module.exports = protoclass(BaseAccessor, {
  __isScope: true,
  get: function (context, path) {
    // override me
  },
  set: function (context, path, value) {
    // override me
  },
  watchProperty: function (context, path, listener) {
    // override me
  },
  watchEvent: function (context, operation, listener) {
    // override me
  },
  dispose: function () {
    
  }
});

