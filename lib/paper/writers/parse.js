var BaseWriter = require("./base");

function ParseWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(ParseWriter, {
  write: function (source) {
    var element;
    
    if (process.browser) {
      element = this.nodeFactory.createElement("div");
      element.innerHTML = source;
    } else {
      element = this.nodeFactory.createTextNode(source);
    }

    return element;
  }
});

module.exports = ParseWriter;
