var text     = require("./text");
var element  = require("./element");
var fragment = require("./fragment");
var comment  = require("./comment");

module.exports = {

  /**
   */

  createTextNode: function(nodeValue) {
    return text(nodeValue);
  },

  /**
   */

  createDocumentFragment: function() {
    return fragment([]);
  },

  /**
   */

  createElement: function(nodeName) {
    return element(nodeName);
  }
};
