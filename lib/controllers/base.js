var protoclass = require("protoclass");

function BaseController () {

}

module.exports = protoclass(BaseController, {
  get: function (path) {
    // override me
  },
  set: function (path, value) {
    // override me
  },
  watch: function (path, listener) {
    // override m
  }
});

