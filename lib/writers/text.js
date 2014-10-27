
module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (value) {

    // blank text nodes are NOT allowed. Chrome has an issue rendering
    // blank text nodes - way, WAY slower if this isn't here!
    if (/^\s+$/.test(value)) {
      return nodeFactory.createTextNode("\u00A0");
    };

    return nodeFactory.createTextNode(value);
  };
}