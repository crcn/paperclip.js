var protoclass = require("protoclass")

function Base () {

}

module.exports = protoclass(Base, {
  initialize: function (scope) {
    // OVERRIDE ME
  },
  createDOMNode: function () {
    
  }
});