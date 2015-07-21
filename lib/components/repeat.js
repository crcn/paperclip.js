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

  if (!target) return;

  if (target.forEach) {
    // use API here since target could be an object
    target.forEach(iterate);
  } else {
    for (var key in target) {
      if (target.hasOwnProperty(key)) iterate(target[key], key);
    }
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

  update: function(parent) {

    var as       = this.as;
    var each     = this.each;
    var key      = this.key || "key";

    var n        = 0;
    var self     = this;

    var properties;

    _each(each, function(model, k) {

      var child;

      if (as) {
        properties       = { };
        properties[key]  = k;
        properties[as]   = model;
      } else {
        properties = model;
      }

      if (n >= self._children.length) {
        child = self._cTemplate.view(properties, {
          parent: parent
        });
        self._children.push(child);
        self.section.appendChild(child.render());
      } else {
        child = self._children[n];

        if (properties !== model) {
          child.set(as, model);
        } else if (child.context[as] !== model) {
          child.update(properties);
        }
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
