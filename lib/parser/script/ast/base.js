var protoclass = require("protoclass");

function BaseScriptExpression () {
  this._children = [];
  this._addChildren(Array.prototype.slice.call(arguments, 0));
}

protoclass(BaseScriptExpression, {

  /**
   */

  __isExpression: true,

  /**
   */

  _addChildren: function (children) {
    for (var i = children.length; i--;) {
      var child = children[i];
      if (child.__isExpression) {
        this._children.push(child);
      } else if (typeof child === "object") {
        for (var k in child) {
          this._addChildren([child[k]]);
        }
      }
    }
  },

  /**
   */

  _filterAllChildren: function (filter) {
    var filtered = [];
    for (var i = this._children.length; i--;) {
      var child = this._children[i];
      if (filter(child)) {
        filtered.push(child);
      }
      filtered = filtered.concat(child._filterAllChildren(filter));
    }
    return filtered;
  }
});

module.exports = BaseScriptExpression;