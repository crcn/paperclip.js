var ivd                = require("ivd");
var compiler           = require("./compiler");
var extend             = require("xtend/mutable");
var defaultComponents  = require("./components");
var defaultAttributes  = require("./attributes");
var createBindingClass = require("./createBindingClass");
var View               = require("./view");

/**
 */

module.exports = function(source, options) {
  var createVNode = typeof source === "string" ? compiler.compile(source, options) : source;
  var vnode       = createVNode(ivd.fragment, ivd.element, ivd.text, ivd.comment, ivd.dynamic, createBindingClass);

  if (!options) options = {};

  if (!options.document && typeof document !== "undefined") {
    options.document = document;
  }

  return ivd.template(vnode, extend({
    components : defaultComponents,
    attributes : defaultAttributes,
    viewClass  : View
  }, options));
};
