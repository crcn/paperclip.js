var createDocumentSection = require("document-section");

module.exports = {
  getNodePath: function(node) {

    var path = [];
    var p    = node.parentNode;
    var c    = node;

    while (p) {

      // need to slice since some browsers don't support indexOf for child nodes
      path.unshift(Array.prototype.slice.call(p.childNodes).indexOf(c));
      c = p;
      p = p.parentNode;
    }

    return path;
  },
  getNodeByPath: function(node, path) {

    var c = node;

    for (var i = 0, n = path.length; i < n; i++) {
      c = c.childNodes[path[i]];
    }

    return c;
  }
};
