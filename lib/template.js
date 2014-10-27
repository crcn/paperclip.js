var protoclass = require("protoclass"),
BindableObject = require("bindable-object"),
parser         = require("./parser"),
View           = require("./view"),
Clips          = require("./clips"),

fragmentWriter = require("./writers/fragment"),
blockWriter    = require("./writers/block"),
textWriter     = require("./writers/text"),
commentWriter  = require("./writers/comment");
elementWriter  = require("./writers/element");

function Template (paper, application, cacheNode) {
  this.paper       = paper;
  this.application = application;
  this.paperclip   = application.paperclip;
  this.cacheNode   = !!cacheNode;
  this.clips       = new Clips();
}

protoclass(Template, {

  /**
   */

  bind: function (context) {

    if (!context) context = {};

    // TODO - sync changes back to context
    if (!context.__isBindable) context = new BindableObject(context);

    return new View(this, this._getNode()).bind(context);
  },

  /**
   */

  _getNode: function () {

    // IE doesn't support this, so cloneNode must be optional here
    if (this._cachedNode) return this._cachedNode.cloneNode(true);

    this.clips = new Clips(this);

    var node = this.paper(
      fragmentWriter(this),
      blockWriter(this),
      elementWriter(this),
      textWriter(this),
      commentWriter(this),
      parser,
      this.paperclip.modifiers
    );

    this.clips.prepare();

    return this.cacheNode ? (this._cachedNode = node) && this._getNode() : node;
  }
});

module.exports = function (source, application) {

  var paper;

  if (typeof source === "string") {
    paper = parser.compile(source);
  } else {
    paper = source;
  }

  if (paper.template) return paper.template;

  return paper.template = new Template(paper, application, true);
}