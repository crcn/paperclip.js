var Base = require("../../../bindings/attrs/base")

module.exports = Base.extend({

  /**
   */

  didChange: function (value) {
    this.node.setAttribute(this.attrName, value);
  }
});
