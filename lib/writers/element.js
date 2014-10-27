module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (name, attributes, childNodes) {
    var element = nodeFactory.createElement(name);

    for (var key in attributes) {
      element.setAttribute(key, attributes[key]);
    }

    if (childNodes.length) {
      element.appendChild(childNodes.length > 1 ? nodeFactory.createFragment(childNodes) : childNodes[0]);
    }
    
    return element;
  };
}