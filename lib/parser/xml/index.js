var BaseParser = require("../base/parser"),
ScriptParser   = require("../script"),
XMLTokenizer   = require("./tokenizer"),
TokenCodes     = XMLTokenizer.codes;

var NodeExpression   = require("./ast/node"),
AttributeExpression  = require("./ast/attribute"),
AttributesExpression = require("./ast/attributes"),
ChildNodesExpression = require("./ast/childNodes"),
RootExpression       = require("./ast/root"),
StringExpression     = require("./ast/string"),
TextNodeExpression   = require("./ast/textNode"),
BlockExpression      = require("./ast/block"),
prune                = require("./prune");


function XMLParser () {
  BaseParser.call(this, new XMLTokenizer());
  this._scriptParser = new ScriptParser();
}

var groups = {
  SCRIPT: TokenCodes.SCRIPT | TokenCodes.BSCRIPT | TokenCodes.ESCRIPT
};


BaseParser.extend(XMLParser, {

  /**
   */

  _parse: function () {

    var expressions = [], child;

    this._t.next();

    while (this._t.current) {
      expressions.push(this._parseExpression());
    }

    var root = new RootExpression(this._trimTextNodes(expressions));

    if (false) {
      root = prune.combineTextBlocks(root); // rendering is a bit slower
    }

    return root;
  },

  /**
   */

  _parseExpression: function () {

    var ccode;

    if (!(ccode = this._t.currentCode)) return;

    // <
    if (ccode === TokenCodes.LT) {
      return this._parseNodeExpression();

    // {{ script }} or {{#block}}{{/}}
    } else if (ccode & groups.SCRIPT) {
      return this._parseScriptBlockExpression();

    // something like <!HTML>
    } else if (ccode === TokenCodes.SN) {
      return this._parseStringNodeExpression();

    // text
    } else {
      return this._parseTextNodeExpression();
    }
  },

  /**
   */

  _parseNodeExpression: function () {


    var nodeName = this._t.next()[1];

    this._t.next(); // eat name

    var attributes   = this._parseNodeAttributeExpressions();

    var etag         = this._t.currentCode,
    children;


    if (etag === TokenCodes.GT) {
      this._t.next(); // eat >
      children = this._parseChildNodeExpressions();

      this._t.next(); // eat </

      // assert node name matches
      this._t.next(); // eat node name
      this._t.next(); // eat >

    } else {
      children = new ChildNodesExpression([]);
      this._t.next(); // eat />
    }

    this._t.skipWhite();

    return new NodeExpression(nodeName, attributes, children);
  },

  /**
   */

  _parseNodeAttributeExpressions: function () {
    var attrExprs = [];

    this._skipWs();

    while (this._t.currentCode === TokenCodes.WORD) {
      attrExprs.push(this._parseNodeAttributeExpression());

      this._skipWs();
    }


    return new AttributesExpression(attrExprs);
  },

  /**
   */

  _skipWs: function () {
    while(this._t.currentCode === TokenCodes.WS) {
      this._t.next();
    }
  },

  /**
   */

  _parseNodeAttributeExpression: function () {
    var attrName = this._t.current[1];

    this._t.nextSkipWhite(); // eat name

    var values = [];

    if (this._t.current[0] === TokenCodes.EQ) {
      this._t.nextSkipWhite(); // eat = 
      values = this._parseAttributeValues();
    }


    return new AttributeExpression(attrName, values);
  },

  /**
   */

  _parseAttributeValues: function () {



    var quoteCode = this._t.currentCode,
    ccode;

    this._t.nextSkipWhite(); // eat quote

    var values = [], buffer = [];

    while ((ccode = this._t.currentCode) !== quoteCode && ccode) {
      if (!(ccode & groups.SCRIPT)) {
        buffer.push(this._t.current[1]);
        this._t.next();
      } else {
        if (buffer.length) {
          values.push(new StringExpression(buffer.join("")));
          buffer = [];
        }
        values.push(this._parseAttrScriptExpression()); 
      }
    }

    if(buffer.length) {
      values.push(new StringExpression(buffer.join("")));
    }

    this._t.next(); // eat quote

    return values;
  },

  /**
   */

  _parseAttrScriptExpression: function () {
    var script = this._t.current[1];
    this._t.next();

    var root = this._scriptParser.parse(script);

    if (root.expressions[0].name === "value") {
      return root.expressions[0];
    }

    return root;
  },

  /**
   */

  _parseChildNodeExpressions: function () {

    var children = [], child;

    while (this._t.currentCode !== TokenCodes.LTSL && (child = this._parseExpression())) {
      children.push(child);
    }

    return new ChildNodesExpression(this._trimTextNodes(children));
  },

  /**
   */

  _parseScriptBlockExpression: function () {

    var source = this._t.current[1];

    // if block, or end script, scripts must be defined. If something like {{/else}} , it needs to be else:true
    if ((this._t.currentCode & (TokenCodes.ESCRIPT|TokenCodes.BSCRIPT)) && !~source.indexOf(":")) {
      source += ":true";
    }

    var script = this._scriptParser.parse(source),
    ccode      = this._t.current[0];

    this._t.next(); // eat script

    var expressions = [],
    childBlockExpression;

    if (ccode & (TokenCodes.BSCRIPT | TokenCodes.ESCRIPT)) {
      while ((ccode = this._t.currentCode) !== TokenCodes.ESCRIPT && ccode) {
        expressions.push(this._parseExpression());
      }
    }

    if (ccode === TokenCodes.ESCRIPT) {

      // make sure there's a script
      if (this._t.current[1]) {
        childBlockExpression = new RootExpression([this._parseScriptBlockExpression()]);
      } else {
        this._t.next(); // no script - it's a end block {{/}}. Eat it.
      }
    }

    return new BlockExpression(script, new RootExpression(this._trimTextNodes(expressions)), childBlockExpression);
  },

  /**
   */

  _trimTextNodes: function (expressions) {


    function _trim (exprs) {
      var expr, i;
      for (i = exprs.length; i--;) {
        expr = exprs[i];
        if (expr.type == "textNode" && !/\S/.test(expr.value)) {
          exprs.splice(i, 1);
        } else {
          break;
        }
      }
      return exprs;
    }

    return _trim(_trim(expressions.reverse()).reverse());
  },

  /**
   */

  _parseStringNodeExpression: function () {
    var buffer = this._t.current[1];
    this._t.next(); // eat it.
    return new TextNodeExpression(buffer);
  },

   /**
    */

  _parseTextNodeExpression: function () {

    var ecode = TokenCodes.BSCRIPT | TokenCodes.SCRIPT | TokenCodes.ESCRIPT | TokenCodes.LT | TokenCodes.LTSL;

    var ccode, buffer = "";

    while (!((ccode = this._t.currentCode) & ecode) && ccode) {
      buffer += this._t.current[1];
      this._t.next();
    }

    return new TextNodeExpression(buffer);
  }
});

module.exports = XMLParser;