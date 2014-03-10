var BaseWriter = require("./base");

function FragmentWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(FragmentWriter, {
  write: function (children) {
    if (children.length === 1) return children[0];
    return this.nodeFactory.createFragment(children);
  }
});

module.exports = FragmentWriter;
