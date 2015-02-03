var protoclass = require("protoclass");

function BaseScope (context) {
  this.context = context;
  this.watcher = this;
}

module.exports = protoclass(BaseScope, {
  get: function (path) {
    // override me
  },
  set: function (path, value) {
    // override me
  },
  watchProperty: function (path, listener) {
    // override me
  },
  watchColletion: function (target, operation, listener) {
    // override me
  },
  child: function (context) {
    // override me
  }
});

