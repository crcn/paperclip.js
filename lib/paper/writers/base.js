var protoclass = require("protoclass"),
_ = require("underscore");


function BaseWriter (template) {
  this.template    = template;
  this.nodeFactory = template.application.nodeFactory;
  this.application = this.template.application;
  this.binders     = template.binders;
  this.write       = _.bind(this.write, this);
}

protoclass(BaseWriter, {
  write: function (script, contentFactory, childBlockFactory) { }
});

module.exports = BaseWriter;
