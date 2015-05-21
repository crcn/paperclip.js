var extend = require("xtend/mutable");
var ivd    = require("ivd");

/**
 */

function Repeat(section, vnode, attributes, options) {
  extend(this, attributes);
  this.section    = section;
  this._cTemplate  = ivd.template(vnode, options);
  this._children   = [];
}

/**
 */

function _each(target, iterate) {
  if (Object.prototype.toString.call(target) === "[object Array]") {
    for (var i = 0, n = target.length; i < n; i++) iterate(target[i], i);
  } else {
    for (var key in target) iterate(target[key], key);
  }
}

/**
 */

extend(Repeat.prototype, {

  /**
   */

  setAttribute: function(k, v) {
    this[k] = v;
  },

  /**
   */

  update: function() {

    var as       = this.as;
    var each     = this.each;

    var n        = 0;
    var self     = this;

    var properties;

    _each(each, function(model, key) {

      if (as) {
        properties       = { };
        properties[key]  = key;
        properties[as]   = model;
      } else {
        properties = model;
      }

      // var child = this.cTemplate.view(ctx);

      if (n >= self._children.length) {
        var child = self._cTemplate.view(properties);
        self._children.push(child);
        self.section.appendChild(child.render());
      } else {
        var child = self._children[n];
        child.update(properties);
      }

      n++;
    });

    this._children.splice(n).forEach(function(child) {
      child.remove();
    });
  }
});

/**
 */

module.exports = Repeat;
