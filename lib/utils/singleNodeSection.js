module.exports = function(node) {
  return {
    node: node,
    render: function() {
      return node;
    },
    remove: function() {
      node.parentNode.removeChild(node);
    },
    appendChild: function(childNode) {
      node.appendChild(childNode);
    }
  };
};
