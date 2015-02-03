var ScopedBindableObject = require("scoped-bindable-object");

function BindableObjectController (properties, parent) {
  ScopedBindableObject.call(this, properties, parent);
  this.context = this;
  this.watcher = this;
  this.serializer = this;

  this.on("change", function (k, v) {
    properties[k] = v;
  });
}


module.exports = ScopedBindableObject.extend(BindableObjectController, {
  // get is defined
  // set is defined
  watch: function (property, listener) {
    return this.bind(property, listener);
  },
  child: function (properties) {
    return new BindableObjectController(properties, this);
  },


  // watcher
  watchProperty: function (target, property, listener) {

  },

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

  deserializeCollection: function (collection) {
    return collection.source || collection;
  },

});