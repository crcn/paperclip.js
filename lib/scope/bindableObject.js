var BaseScope        = require("./base"),
ScopedBindableObject = require("scoped-bindable-object");

/**
 */

function BindableObjectScope (properties, parent) {
  if (!properties) properties = {};

  var context = properties.__isBindable ? properties : new ScopedBindableObject(properties, parent ? parent.context : void 0);

  BaseScope.call(this, context, parent);
  this.watcher = this;
  this.deserializer = this;


  if (!properties.__isBindable) {
    var self = this;
    this.context.on("change", function (k, v) {
      if (!~k.indexOf(".")) properties[k] = v;
    });
  }
}

/**
 */

module.exports = BaseScope.extend(BindableObjectScope, {

  /**
   */

  __isScope: true,

  /**
   */
   
  get: function (path) { 
    return this.context.get(path);
  },

  /**
   */
   
  set: function (path, value) { 
    return this.context.set(path, value); 
  },

  /**
   */
   
  watch: function (property, listener) {
    return this.context.bind(property, listener);
  },

  /**
   */
   
  setProperties: function (properties) {
    this.context.setProperties(properties);
  },

  /**
   */
   
  child: function (properties) {
    return new BindableObjectScope(properties, this);
  },

  /**
   */
   
  watchProperty: function (target, property, listener) {
    return target.bind(property, listener);
  },

  /**
   */
   
  watchCollection: function (target, operation, listener) {
    if (!target.__isBindableCollection) return { dispose: function(){} };
    if (operation === "change") {
      return target.on("update", listener);
    }
  },

  /**
   */

  deserializeObject: function (object) {
    return object.toJSON();
  },

  /**
   */

  deserializeCollection: function (collection) {
    return collection.source || collection;
  },

});