module.exports = function (template) {

  var nodeFactory    = template.application.nodeFactory,
  attrBindingFactory = template.paperclip.attrBindingFactory;

  return function (name, attributes, childNodes) {
    var element = nodeFactory.createElement(name);

    for (var key in attributes) {

      var value = attributes[key];

      if (typeof value === "string") {
        element.setAttribute(key, value);
      } else {
        if (value.length === 1) {
          template.clips.push({
            prepare: function () {

            },
            hydrate: function () {

            }
          });
        } else {

        }
      }

    }

    if (childNodes.length) {
      element.appendChild(childNodes.length > 1 ? nodeFactory.createFragment(childNodes) : childNodes[0]);
    }
    
    return element;
  };
}