var TextNode = require("./text");
var Fragment = require("./fragment");
var Element  = require("./element");

var registered = {};

module.exports = {
  createTextNode: function(value) {
    return new TextNode(value);
  },
  createDocumentFragment: function() {
    return new Fragment();
  },
  registerElement: function(nodeName, clazz) {
    registered[nodeName] = clazz;
  },
  createElement: function(nodeName) {
    var clazz = registered[nodeName] || Element;
    return new clazz(nodeName);
  }
}
