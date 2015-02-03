var protoclass = require("protoclass");

function PropertyAccessors () {

}

module.exports = protoclass(PropertyAccessors, {

  /**
   */

  get: function (object, property) {
    return object.get(property);
  },

  /**
   */


  set: function (object, property, value) {
    object.set(property, value);
  },

  /**
   */

  watch: function (object, property, listener) {
    object.bind(property, listener);
  }
});

