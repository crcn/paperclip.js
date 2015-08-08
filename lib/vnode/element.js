var protoclass       = require("protoclass");
var createSection    = require("./section");
var fragment         = require("./fragment");
var FragmentSection  = require("./_fragment-section");
var NodeSection      = require("./_node-section");

/**
 */

function Element(nodeName, attributes, childNodes) {
  this.nodeName   = String(nodeName).toLowerCase();
  this._nodeNameNoDashes = this.nodeName.replace(/-/g, "");
  this.attributes = attributes || {};
  this.childNodes = childNodes;
  this.target     = this;
  for (var i = childNodes.length; i--;) {
    childNodes[i].parentNode = this;
  }
}

protoclass(Element, {
  nodeType: 1,
  freeze: function(options, hydrators) {

    var components = options.components || {};
    var attributes = options.attributes || {};

    if (components[this._nodeNameNoDashes]) {
      return this._freezeComponent(components[this._nodeNameNoDashes], options, hydrators);
    }

    return this._freezeElement(options, hydrators);
  },
  setAttribute: function(key, value) {
    this.attributes[key] = value;
  },
  _freezeComponent: function(clazz, options, hydrators) {

    // TODO - check parent node to see if there are anymore children. If not, then user NodeSection
    var section = new FragmentSection(options.document);
    hydrators.push(new ComponentHydrator(clazz, section, this, this._splitAttributes(options), options));
    return section.render();
  },
  _freezeElement: function(options, hydrators) {

    var element = options.document.createElement(this.nodeName);

    var inf = this._splitAttributes(options);

    for (var attrName in inf.staticAttributes) {
      element.setAttribute(attrName, inf.staticAttributes[attrName]);
    }

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      element.appendChild(this.childNodes[i].freeze(options, hydrators));
    }

    if (Object.keys(inf.dynamicAttributes).length) {
      hydrators.push(new ElementAttributeHydrator(new NodeSection(options.document, element), options, inf.dynamicAttributes));
    }

    return element;
  },
  _splitAttributes: function(options) {

    var dynamicAttributes = {};
    var staticAttributes  = {};

    if (options.attributes) {
      for (var key in this.attributes) {
        var attrClass = options.attributes[key];
        if (attrClass && (!attrClass.test || attrClass.test(this, key, this.attributes[key]))) {
          dynamicAttributes[key] = this.attributes[key];
        } else {
          staticAttributes[key]  = this.attributes[key];
        }
      }
    } else {
      staticAttributes = this.attributes;
    }


    return {
      dynamicAttributes : dynamicAttributes,
      staticAttributes  : staticAttributes
    };
  }
})


/**
*/

function ComponentHydrator(clazz, section, element, attrInfo, options) {
  this.clazz                = clazz;
  this.section              = section;
  this.element              = element;
  this.dynamicAttributes    = attrInfo.dynamicAttributes;
  this.attributes           = attrInfo.staticAttributes;
  this.hasDynamicAttributes = !!Object.keys(attrInfo.dynamicAttributes).length;
  this.options              = options;
}


protoclass(ComponentHydrator, {
  hydrate: function(root, view) {
    if (!this._marker) this._marker = this.section.createMarker();
    var ref = new this.clazz(this._marker.createSection(root), this.element, this.attributes, view);
    if (this.hasDynamicAttributes) {
      _hydrateDynamicAttributes(ref, this.options, this.dynamicAttributes, view);
    }
    if (ref.update) view.bindings.push(ref);
  }
})

/**
 */

module.exports = function(name, attributes, children) {
  return new Element(name, attributes, Array.prototype.slice.call(arguments, 2));
};

/**
 */

function ElementAttributeHydrator(section, options, dynamicAttributes) {
  this.section           = section;
  this.options           = options;
  this.dynamicAttributes = dynamicAttributes;
}

protoclass(ElementAttributeHydrator, {
  hydrate: function(root, view) {
    if (!this._marker) this._marker = this.section.createMarker();
    _hydrateDynamicAttributes(this._marker.findNode(root), this.options, this.dynamicAttributes, view);
  }
})

/**
 */

function _hydrateDynamicAttributes(ref, options, dynamicAttributes, view) {
  for (var key in dynamicAttributes) {
    var clazz = options.attributes[key];
    var attr = new clazz(ref, key, dynamicAttributes[key], view);
    if (attr.update) view.bindings.push(attr);
  }
}
