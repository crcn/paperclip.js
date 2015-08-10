var Container = require("./container");

function Element (nodeName, target) {
  Element.superclass.call(this, target);

  this.nodeName    = nodeName.toUpperCase();
  this._name       = nodeName.toLowerCase();
  this.attributes  = [];
  this._attrsByKey = {};
}

Container.extend(Element, {

  /**
   */

  nodeType: 3,

  /**
   */

  setAttribute: function (name, value) {

    this.target[name] = value;
    name = name.toLowerCase();
    // console.log(name, value);

    if (value == undefined) {
      return this.removeAttribute(name);
    }

    var abk,
    hasChanged;

    if (!(abk = this._attrsByKey[name])) {
      this.attributes.push(abk = this._attrsByKey[name] = {})
    }

    hasChanged = abk.value != value;

    abk.name  = name;
    abk.value = value;

    if (hasChanged) this._triggerChange();
  },

  /**
   */

  removeAttribute: function (name) {

    var hasChanged;

    for (var i = this.attributes.length; i--;) {
      var attr = this.attributes[i];
      if (attr.name == name) {
        hasChanged = true;
        this.attributes.splice(i, 1);
        delete this._attrsByKey[name];
        break;
      }
    }

    if (hasChanged) this._triggerChange();
  },

  /**
   */

  getAttribute: function (name) {
    var abk;
    if(abk = this._attrsByKey[name]) return abk.value;
  },

  /**
   */

  getInnerHTML: function () {

    var buffer = "<" + this._name,
    attribs    =  "",
    attrbuff;

    for (var name in this._attrsByKey) {

      var v    = this._attrsByKey[name].value;
      attrbuff = name;

      if (name != undefined) {
        attrbuff += "=\"" + v + "\"";
      }

      attribs += " " + attrbuff;
    }

    if (attribs.length) {
      buffer += attribs;
    }


    return buffer + ">" + this.childNodes.join("") + "</" + this._name + ">"
  },

  /**
   */

  cloneNode: function () {
    var clone = new this.constructor(this.nodeName);

    for (var key in this._attrsByKey) {
      clone.setAttribute(key, this._attrsByKey[key].value);
    }

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    clone._buffer = this._buffer;

    return clone;
  }
});

module.exports = Element;
