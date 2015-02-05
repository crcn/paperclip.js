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
  accessible: function (context) {
    // override me
  },
  cast: function (context) {
    // override me
  },
  get: function (context, path) {
    // override me
  },
  set: function (context, path, value) {
    // override me
  },
  call: function (context, ctxPath, fnPath, params) {
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

