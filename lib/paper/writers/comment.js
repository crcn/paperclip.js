var BaseWriter = require("./base");

function CommentWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(CommentWriter, {
  write: function (text) {
    return this.nodeFactory.createComment(text);
  }
});

module.exports = CommentWriter;
