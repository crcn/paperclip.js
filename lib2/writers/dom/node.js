var protoclass = require("protoclass");

function Node () {

}

module.exports = protoclass(Node, {

  /**
   * creates real DOM nodes with the given options
   */

  render: function (options) {
    // OVERRIDE ME
  }
});