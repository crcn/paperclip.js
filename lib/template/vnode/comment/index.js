var protoclass = require("protoclass");

/**
 */

function Comment(value) {
  this.value    = value;
}

/**
 */

module.exports = protoclass(Comment, {

  /**
   */

  initialize: function(template) {
    return template.document.createComment(this.value);
  }
});

/**
 */

module.exports.create = function(value) {
  return new Comment(value);
};
