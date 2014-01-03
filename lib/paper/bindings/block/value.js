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

    // minor optimization - don't create text nodes unnessarily
    if (process.env.browser) {
      var cn = this.section.start.nextSibling;
      if (cn !== this.section.end) {
        cn.nodeValue = value;
        return;
      }

      this.section.append(this.application.nodeFactory.createTextNode(String(value), true));

    } else {
      this.section.replaceChildNodes(this.application.nodeFactory.createTextNode(String(value), true));
    }
  }
});

module.exports = ValueDecor;