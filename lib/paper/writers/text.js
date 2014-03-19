var BaseWriter = require("./base");

function TextWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(TextWriter, {
  write: function (text) {
    return this.nodeFactory.createTextNode(text);
  }
});

module.exports = TextWriter;
