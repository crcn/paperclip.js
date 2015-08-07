var ivd                = require("./vnode");
var extend             = require("xtend/mutable");
var createBindingClass = require("./create-binding-class");

/**
 */

module.exports = function(source, options) {

  var vnode;
  var createVNode;

  if (typeof source === "object") {
    vnode = source;
  } else {

    // TODO - use options parser here
    createVNode = typeof source === "string" ? options.compile(source, options) : source;
    vnode       = createVNode(ivd.fragment, ivd.element, ivd.text, ivd.comment, ivd.dynamic, createBindingClass);
  }

  if (!options) options = {};

  if (!options.document && typeof document !== "undefined") {
    options.document = document;
  }

  return ivd.template(vnode, options);
};
