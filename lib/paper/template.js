var protoclass    = require("protoclass"),
nofactor          = require("nofactor"),
FragmentWriter    = require("./writers/fragment"),
BlockWriter       = require("./writers/block"),
TextWriter        = require("./writers/text"),
CommentWriter     = require("./writers/comment"),
TextBlockWriter   = require("./writers/textBlock"),
ElementWriter     = require("./writers/element"),
ParseWriter       = require("./writers/parse"),
BindingCollection = require("./bindings/collection"),
BinderCollection  = require("./bindings/binders"),
Application       = require("mojo-application"),
animator          = require("mojo-animator"),
bindable          = require("bindable"),
loaf              = require("loaf"),
PaperBinding      = require("./binding");


function Template (paper, application, ops) {
  this.paper           = paper;
  this.application     = application;
  this.nodeFactory     = application.nodeFactory;
  this.useTemplateNode = ops.useTemplateNode;
  this._bindingPool    = [];
}


protoclass(Template, {

  /**
   * useful for warming up a template
   */

  load: function (section) {

    if (!this._templateNode || !this.useTemplateNode) {
      this._templateNode = this._createTemplateNode();
    }

    var node = this.useTemplateNode ? this._templateNode.cloneNode(true) : this._templateNode;
    var bindings = this.binders.getBindings(node);

    if (!section) {
      section = loaf(this.nodeFactory);
    }

    section.append(node);

    return new PaperBinding(this, node, bindings, section, this.nodeFactory);
  },

  /**
   * binds loads, and binds the template to a context
   */

  bind: function (context, section) {

    if (!context) {
      context = {};
    }

    if (!context.__isBindable) {
      context = new bindable.Object(context);
    }

    return this.load(section).bind(context);
  },

  /**
   * create the template node so we don't re-construct the DOM each time - this
   * is optimal - we can use cloneNode instead which defers the DOM creation to the browser.
   */

  _createTemplateNode: function () {

    this.binders         = new BinderCollection();

    var writers = {
      fragment  : new FragmentWriter(this),
      block     : new BlockWriter(this),
      text      : new TextWriter(this),
      comment   : new CommentWriter(this),
      element   : new ElementWriter(this),
      parse     : new ParseWriter(this)
    };

    var node = this.paper(
      writers.fragment.write,
      writers.block.write,
      writers.element.write,
      writers.text.write,
      writers.comment.write,
      writers.parse.write,
      this.application.paperclip.modifiers
    );

    this.binders.init();

    return node;
  }

});


var tpl = Template.prototype.creator = module.exports = function (paperOrSrc, application) {

  var paper, isIE = false;

  if (!application) {
    application = Application.main;
  }

  if (!application.animate) {
    application.use(animator);
  }

  if (typeof paperOrSrc === "string") {

    if (!tpl.compiler) {
      throw new Error("template must be a function");
    }

    paper = tpl.compiler.compile(paperOrSrc, { eval: true });
  } else {
    paper = paperOrSrc;
  }

  // check for all versions of IE - IE doesn't properly support 
  // element.cloneNode(true), so we can't use that optimization.
  if (process.browser) {
    isIE = !!(~navigator.userAgent.toLowerCase().indexOf("msie") || ~navigator.userAgent.toLowerCase().indexOf("trident"))
  }

  var ops = {
    useTemplateNode: !isIE && !application.debug
  };

  if (paper.template) {
    return paper.template;
  }

  return paper.template = new Template(paper, application, ops);
}
