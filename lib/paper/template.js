var protoclass = require("protoclass"),
modifiers      = require("./modifiers"),
nofactor       = require("nofactor"),
FragmentWriter = require("./writers/fragment"),
BlockWriter    = require("./writers/block"),
TextWriter     = require("./writers/text"),
ElementWriter  = require("./writers/element"),
ParseWriter    = require("./writers/parse"),
BindingCollection = require("./bindings/collection"),
BinderCollection  = require("./bindings/binders"),
bindable = require("bindable")
loaf = require("loaf"),
PaperBinding = require("./binding");


function Template (paper, application) {
  this.paper         = paper;
  this.application   = application;
  this.nodeFactory   = application.nodeFactory;
  this.binders       = new BinderCollection();
  this._templateNode = this._createTemplateNode();
}


protoclass(Template, {

  /**
   */

  bind: function (context) {

    if (!context) {
      context = {};
    }

    if (!context.__isBindable) {
      context = new bindable.Object(context);
    }

    var node = this._templateNode.cloneNode(true),
    bindings = this.binders.getBindings(node),
    section  = loaf(this.nodeFactory);

    bindings.bind(context);

    section.append(node);

    return new PaperBinding(node, context, bindings, section, this.nodeFactory);
  },

  /**
   */

  _createTemplateNode: function () {

    var writers = {
      fragment : new FragmentWriter(this),
      block    : new BlockWriter(this),
      text     : new TextWriter(this),
      element  : new ElementWriter(this),
      parse    : new ParseWriter(this)
    }

    return this.paper(
      writers.fragment.write,
      writers.block.write,
      writers.element.write,
      writers.text.write,
      writers.parse.write,
      modifiers
    );
  }

});


var tpl = Template.prototype.creator = module.exports = function (paperOrSrc, application) {

  var paper;

  if (!application) {
    application = {
      nodeFactory: nofactor["default"]
    }
  }

  if (typeof paperOrSrc === "string") {

    if (!tpl.compiler) {
      throw new Error("template must be a function");
    }

    paper = tpl.compiler.compile(paperOrSrc, { eval: true });
  } else {
    paper = paperOrSrc;
  }

  if (paper.template) {
    return paper.template;
  }

  return paper.template = new Template(paper, application);
}