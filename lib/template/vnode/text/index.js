var protoclass = require("protoclass");

/**
 */

function Text(value) {
  this.value = value;
}

/**
 */

module.exports = protoclass(Text, {

  /**
   */

  initialize: function(template) {

    // blank text nodes are NOT allowed. Chrome has an issue rendering
    // blank text nodes - way, WAY slower if this isn't here!
    if (/^\s+$/.test(this.value)) {
      return template.nodeFactory.createTextNode("\u00A0");
    }

    return template.nodeFactory.createTextNode(this.value);
  }
});

/**
 */

module.exports.create = function(value) {
  return new Text(value);
};
