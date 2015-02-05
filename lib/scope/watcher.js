var protoclass = require("protoclass")

/**
 */

function Watcher () {

}

/**
 */

protoclass(Watcher, {

  /**
   */

  watchProperty: function (object, property, listener) {
    // override me
  },

  /**
   */

  watchCollection: function (collection, operations, listener) {
    // override me
  }
});