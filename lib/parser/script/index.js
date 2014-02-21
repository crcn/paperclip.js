var BaseParser  = require("../base/parser"),
ScriptTokenizer = require("./tokenizer"),
TokenCodes      = ScriptTokenizer.codes;

var ReferenceExpression = require("./ast/reference"),
CallExpression          = require("./ast/call"),
OtherExpression         = require("./ast/other"),
ModifierExpression      = require("./ast/modifier");


function ScriptParser () {
  BaseParser.call(this, new ScriptTokenizer());
}




BaseParser.extend(ScriptParser, {

  /**
   */

  _parse: function () {

    var expressions = [];

    this._t.next();

    while (this._t.current) {
      expressions.push(this._parseExpression());
    }

    console.log(JSON.stringify(expressions, null, 2));
  },

  /**
   */

  _parseExpression: function () {
    var ccode;

    if (!(ccode = this._t.currentCode)) return;

    if (ccode === TokenCodes.LP) {
      return this._parseGroupExpression();

    } else if (ccode & (TokenCodes.VAR | TokenCodes.TICK)) {
      return this._parseReferenceExpression();

    } else if (ccode === TokenCodes.NUMBER) {
      return this._parseNumberExpression();

    } else if (ccode === TokenCodes.STRING) {
      return this._parseStringExpression();
    } else {
      return this._parseOtherExpression();
    }
  },

  /**
   */

  _parseGroupExpression: function () {

  },

  /**
   * parses a.b.c
   */

  _parseReferenceExpression: function () {

    var unbound = this._t.currentCode === TokenCodes.TICK,
    ccode;

    if (unbound) {
      this._t.next(); // eat `
    }

    ccode = this._t.currentCode;

    var path = [];

    while (ccode === TokenCodes.VAR) {
      path.push(this._t.current[1]);

      this._t.next(); // eat var

      if ((ccode = this._t.currentCode) === TokenCodes.DOT) {
        ccode = this._t.next()[0]; // eat .
      }
    }

    if (unbound) {
      this._t.next(); // eat `
      ccode = this._t.currentCode;
    }

    var ref = new ReferenceExpression(path, unbound);

    if (ccode === TokenCodes.LP) {
      ref = this._parseCallExpression(ref);
    }


    if (this._t.currentCode === TokenCodes.PIPE) {
      ref = this._parseModifierExpression(ref);
    }

    return ref;
  },

  /**
   */

  _parseModifierExpression: function (refExpression) {

    var name = this._t.next()[1];
    this._t.next();
    
    return new ModifierExpression(name, refExpression, this._parseParams());
  },

  /**
   */

  _parseCallExpression: function (refExpression) {
    return new CallExpression(refExpression, this._parseParams());
  },

  /**
   */

  _parseNumberExpression: function () {
    return this._parseOtherExpression();
  },

  /**
   */

  _parseOtherExpression: function () {
    var chr = this._t.current[1];
    this._t.next();
    return new OtherExpression(chr);
  },

  /**
   */

  _parseParams: function () {
    this._t.next(); // eat (

    var ccode,
    params = [];

    while ((ccode = this._t.currentCode) !== TokenCodes.RP) {
      params.push(this._parseExpression());

      if (this._t.currentCode === TokenCodes.COMA) {
        this._t.next(); // eat ,
      }
    }

    this._t.next(); // eat )

    return params;
  }
});

var p = new ScriptParser();
p.parse("`test.a`(a+5a, b) | filter()");

module.exports = ScriptParser;