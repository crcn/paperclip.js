var protoclass = require("protoclass"),
BaseDecor      = require("./base");

function DefaultDecor (options) {
  this.node = options.node;
  BaseDecor.call(this, options);
}

protoclass(BaseDecor, DefaultDecor, {

});

module.exports = DefaultDecor;