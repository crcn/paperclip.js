var ivd               = require("ivd");
var compiler          = require("./compiler");
var extend            = require("xtend/mutable");
var defaultComponents = require("./components");

/**
 */

module.exports = function(source, options) {
  var createVNode = typeof source === "string" ? compiler.compile(source) : source;
  var vnode       = createVNode(ivd.fragment, ivd.element, ivd.text, ivd.comment, ivd.dynamic, ivd.root, ivd.reference);

  return ivd.template(vnode, extend({
    components: defaultComponents
  }, options));
};
