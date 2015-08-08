var protoclass = require("protoclass");

/**
 */

function Fragment(childNodes) {
  this.childNodes = childNodes;
  this.target     = this;
  for (var i = childNodes.length; i--;) childNodes[i].parentNode = this;
}

protoclass(Fragment, {
  nodeType: 11,
  freeze: function(options, hydrators) {

    var fragment = options.document.createDocumentFragment();

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      fragment.appendChild(this.childNodes[i].freeze(options, hydrators));
    }

    return fragment;
  }
});

/**
 */

module.exports = function(children) {
  if (children.length === 1) return children[0];
  return new Fragment(children);
};
