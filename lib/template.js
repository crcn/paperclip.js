var protoclass = require("protoclass"),
parser         = require("./parser"),
View           = require("./view"),
ViewRecycler   = require("./viewRecycler"),
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

  this._viewPool = [];
}

protoclass(Template, {

  /**
   */

  _getView: function () {
    return this._viewPool.shift() || new View(this, this._getNode());
  },

  /**
   */

  _addView: function (view) {
    this._viewPool.push(view);
  },

  /**
   OLD
   */

  bind2: function (context) {
    // return new ViewRecycler(this).bind(context);
    return new View(this, this._getNode()).bind(context);
  },

  /**
   */

  bind: function (context) {
    return new ViewRecycler(this).bind(context);
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

    this.clips.initialize();

    return this.cacheNode ? (this._cachedNode = node) && this._getNode() : node;
  },

  /**
   */

  create: function (source) {
    return create(source, this.application);
  }
});

function create (source, application) {

  var paper;

  if (typeof source === "string") {
    paper = parser.compile(source);
  } else {
    paper = source;
  }

  if (paper.template) return paper.template;

  return paper.template = new Template(paper, application, true);
}

module.exports = create;