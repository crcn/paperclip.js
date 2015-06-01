/* istanbul ignore next */
function _stringifyNode(node) {

  var buffer = "";

  if (node.nodeType === 11) {
    for (var i = 0, n = node.childNodes.length; i < n; i++) {
      buffer += _stringifyNode(node.childNodes[i]);
    }
    return buffer;
  }

  buffer = node.nodeValue || node.outerHTML || "";

  if (node.nodeType === 8) {
    buffer = "<!--" + buffer + "-->";
  }

  return buffer;
}

module.exports = _stringifyNode;
