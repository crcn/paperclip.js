var protoclass = require("protoclass")

function Text (value) {
  this.value = value;
}

module.exports = protoclass(Text, {
  initialize: function (scope) {
    return scope.nodeFactory.createTextNode(this.value);
  }
});

module.exports.create = function (value) {
  return new Text(value);
}