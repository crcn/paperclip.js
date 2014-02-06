var protoclass = require("protoclass");


function BaseWriter (template) {
  this.template = template;
  this.nodeFactory = template.application.nodeFactory;
  this.application = this.template.application;
  this.binders = template.binders;
}

protoclass(BaseWriter, {
  write: function (script, contentFactory, childBlockFactory) { }
});

module.exports = BaseWriter;