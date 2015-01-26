var protoclass        = require("protoclass"),
createDocumentSection = require("document-section"),
Fragment              = require("./fragment"),
utils                 = require("../../utils"),
BindableObject        = require("bindable-object"),
script                = require("../../script");

// this is the base class for registered components

function Element (name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children
}

function _bindableAttributes (attributes) {
  var b = new BindableObject();

  b.bindings = {

  };

  function _bindAttribute (key, value) {

  }

  for (var k in attributes) _bindAttribute(k, attributes[k]);

  return b;
}

module.exports = protoclass(Element, {
  initialize: function (template) {

    var componentClass = template.components[this.name];


    var attrs = {};

    // check the attributes for any scripts - pluck them out
    // TODO - check for attribute components - apply the same 
    // logic as components
    for (var k in this.attributes) {
      var v = this.attributes[k];
      if (typeof v === "object") {
        attrs[k] = script(v).value;
      } else {
        attrs[k] = v;
      }
    }


    // is a component present?
    if (componentClass) {

      // create a dynamic section - this is owned by the component
      var section = createDocumentSection();

      // TODO - move hydrator to new file
      template.hydrators.push({

        section        : section,
        componentClass : componentClass,
        name           : this.name,
        attributes     : attrs,
        children       : template.child(this.children),

        initialize: function () {
          this.startNodePath = utils.getNodePath(this.section.start);
          this.endNodePath   = utils.getNodePath(this.section.end);
        },

        hydrate: function (view) {
          var clonedSection = createDocumentSection(void 0, utils.getNodeByPath(view.node, this.startNodePath), utils.getNodeByPath(view.node, this.endNodePath));

          // TODO - bind script attrs to these attrs
          var attributes = new BindableObject(this.attributes), localAttrs = this.attributes;

          var component = new componentClass({
            name       : this.name,
            section    : clonedSection,
            attributes : attributes,
            view       : this.view,
            children   : this.children
          });

          // TODO - move attributes binding to new file
          view.bindings.push({
            bindings: [],
            bind: function (context) {
              for (var k in localAttrs) {
                var v = localAttrs[k];
                if (v.bind) {
                  this._bindAttr(context, k, v);
                } else {
                  attributes.set(k, v);
                }
              }
            },
            _bindAttr: function (context, k, v) {
              this.bindings.push(v.bind(context, function (nv, ov) {
                if (nv == ov) return;
                attributes.set(k, nv);
              }).now());
            },
            unbind: function () {
              for (var i = this.bindings.length; i--;) {
                this.bindings[i].dispose();
              }
              this.bindings = [];
            }
          });
          
          // is it bindable?
          if (component.bind) view.bindings.push(component);
        }
      });

      return section.render();
    }


    var element = template.nodeFactory.createElement(this.name); 
    element.appendChild(this.children.initialize(template));
    return element;
  }
});


/*

element("video", [block()])
*/

module.exports.create = function (name, attributes, children) {

  // TODO - check for registered components, 
  return new Element(name, attributes, new Fragment(children));
} 