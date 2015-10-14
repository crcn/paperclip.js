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

    if (typeof source === "string") {
      if (options.compile == void 0) {
        throw new Error("template() must include 'compile' option");
      }
      createVNode = options.compile(source, options);
    } else {
      createVNode = source;
    }

    vnode       = createVNode(ivd.fragment, ivd.element, ivd.text, ivd.comment, ivd.dynamic, createBindingClass);
  }

  if (!options) options = {};

  if (!options.document && typeof document !== "undefined") {
    options.document = document;
  }

  return ivd.template(vnode, options);
};
