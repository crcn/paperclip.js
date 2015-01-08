module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (childNodes) {
    return nodeFactory.createFragment(childNodes);
  };
}