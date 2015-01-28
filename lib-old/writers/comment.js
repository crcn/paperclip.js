module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (comment) {
    return nodeFactory.createComment(comment);
  };
}