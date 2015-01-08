var protoclass = require("protoclass")

// this is the base class for registered components

function Comment (template) {
}

module.exports = protoclass(Comment, {

});

module.exports.create = function (template) {

  // TODO - check for registered components, 
  return new Comment(template);
} 