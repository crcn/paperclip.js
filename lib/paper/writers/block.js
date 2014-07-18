var loaf            = require("loaf"),
BaseWriter          = require("./base");


function BlockWriter () {
  BaseWriter.apply(this, arguments);
}

BaseWriter.extend(BlockWriter, {

  /**
   */

  write: function (script, contentFactory, childBlockFactory) {

    var tpl  = contentFactory    ? this.template.creator(contentFactory, this.application) : undefined,
    childTpl = childBlockFactory ? this.template.creator(childBlockFactory, this.application) : undefined,
    binder,
    ops;

    this.binders.push(binder = this.template.paperclip.blockBindingFactory.getBinder(ops = {
      script             : script,
      template           : tpl,
      application        : this.application,
      childBlockTemplate : childTpl
    }));

    var node = binder.getNode(ops) || this.getDefaultNode(ops);

    binder.prepare(ops);
    return node;
  },

  /**
   */

  getDefaultNode: function (ops) {
    return (ops.section = loaf(this.nodeFactory)).render();
  }
});

module.exports = BlockWriter;
