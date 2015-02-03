var protoclass = require("protoclass");

function PropertyAccessors () {

}

module.exports = protoclass(PropertyAccessors, {

  /**
   */

  accessible: function (value) {
    return value.__isBindableObject;
  },

  /**
   */

  get: function (object, property) {
    return object.get(property);
  },

  /**
   */


  set: function (object, property, value) {
    return object.set(property, value);
  },

  /**
   */

  watch: function (object, property, listener) {
    return object.bind(property, listener);
  }
});

