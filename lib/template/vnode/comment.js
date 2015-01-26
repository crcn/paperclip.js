var protoclass = require("protoclass")

// this is the base class for registered components

function Comment (value) {
  this.value    = value;
}

module.exports = protoclass(Comment, {
  initialize: function (scope) {

  },
});

module.exports.create = function (value) {

  // TODO - check for registered components, 
  return new Comment(value);
} 