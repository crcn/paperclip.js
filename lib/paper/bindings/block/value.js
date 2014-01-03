var protoclass = require("protoclass"),
BaseDecor      = require("./base");

function ValueDecor (options) {
  BaseDecor.call(this, options);
}

protoclass(BaseDecor, ValueDecor, {

  /**
   */

  _onChange: function (value) {

    if (value == undefined) {
      value = "";
    }

    // TODO - this is a good place to have a setup function for DOM elements
    // so that we never have to call this.section.appendChild
    // minor optimization - don't create text nodes unnessarily
    if (process.browser) {
      this.section.start.nextSibling.nodeValue = String(value);
    } else {
      this.section.replaceChildNodes(this.application.nodeFactory.createTextNode(String(value), true));
    }
  }
});

ValueDecor.prepare = function (options) { 
  // console.log(options);
  options.section.append(options.application.nodeFactory.createTextNode("", true));
}

module.exports = ValueDecor;