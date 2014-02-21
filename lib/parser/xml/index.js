var BaseParser = require("../base/parser"),
ScriptParser   = require("../script"),
XMLTokenizer   = require("./tokenizer"),
TokenCodes     = XMLTokenizer.codes,
format         = require("../formatter").format;

var NodeExpression   = require("./ast/node"),
AttributeExpression  = require("./ast/attribute"),
AttributesExpression = require("./ast/attributes"),
ChildNodesExpression = require("./ast/childNodes"),
RootExpression       = require("./ast/root"),
StringExpression     = require("./ast/string"),
TextNodeExpression   = require("./ast/textNode"),
BlockExpression      = require("./ast/block");


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

    var expressions = [];

    this._t.next();

    while (this._t.current) {
      expressions.push(this._parseExpression());
    }

    return new RootExpression(expressions);
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
      return this._parseScriptExpression();

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


    var nodeName = this._t.next()[1],
    attributes   = this._parseNodeAttributeExpressions(),
    etag         = this._t.currentCode,
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

    return new NodeExpression(nodeName, attributes, children);
  },

  /**
   */

  _parseNodeAttributeExpressions: function () {
    var attrExprs = [];

    while (this._t.next()[0] === TokenCodes.WORD) {
      attrExprs.push(this._parseNodeAttributeExpression());
    }

    return new AttributesExpression(attrExprs);
  },

  /**
   */

  _parseNodeAttributeExpression: function () {
    var attrName = this._t.current[1];

    this._t.next(); // eat name
    this._t.next(); // eat = 

    var quoteCode = this._t.currentCode,
    ccode;

    this._t.next(); // eat quote

    var values = [];

    while ((ccode = this._t.currentCode) !== quoteCode) {

      if (ccode === TokenCodes.WORD) {
        values.push(new StringExpression(this._t.current[1]));
      } else if (ccode & groups.SCRIPT) {
        values.push(this._parseScriptExpression()); 
      }

      this._t.next();
    }

    return new AttributeExpression(attrName, values);
  },

  /**
   */

  _parseChildNodeExpressions: function () {

    var children = [], child;

    while (this._t.currentCode !== TokenCodes.LTSL && (child = this._parseExpression())) {
      children.push(child);
    }

    return new ChildNodesExpression(children);
  },

  /**
   */

  _parseScriptExpression: function () {

    var script = this._scriptParser.parse(this._t.current[1]),
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
        childBlockExpression = this._parseScriptExpression();
      } else {
        this._t.next(); // no script - it's a end block {{/}}. Eat it.
      }
    }

    return new BlockExpression(script, new RootExpression(expressions), childBlockExpression);
  },

  /**
   */

  _parseStringNodeExpression: function () {
    // TODO
  },

   /**
    */

  _parseTextNodeExpression: function () {

    // this._t._s.skipWhitespace(false);

    var ecode = TokenCodes.BSCRIPT | TokenCodes.SCRIPT | TokenCodes.ESCRIPT | TokenCodes.LT | TokenCodes.LTSL;

    var ccode, buffer = [];

    while (!((ccode = this._t.currentCode) & ecode) && ccode) {
      buffer.push(this._t.current[1]);
      this._t.next();
    }

    // this._t._s.skipWhitespace(true);

    return new TextNodeExpression(buffer.join(""));
  }
});

var x = new XMLParser();
console.log(format(x.parse("a {{a:a}}").toJavaScript()));

module.exports = XMLParser;