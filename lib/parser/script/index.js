var BaseParser  = require("../base/parser"),
ScriptTokenizer = require("./tokenizer"),
TokenCodes      = ScriptTokenizer.codes,
format          = require("../formatter").format;

var ReferenceExpression = require("./ast/reference"),
CallExpression          = require("./ast/call"),
OtherExpression         = require("./ast/other"),
ModifierExpression      = require("./ast/modifier"),
RootExpression          = require("./ast/root"),
GroupExpression         = require("./ast/group"),
GetExpression           = require("./ast/get"),
SetExpression           = require("./ast/set"),
ParamExpression         = require("./ast/param");

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

    return new RootExpression(expressions);
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
    return new GroupExpression(this._parseParams());
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
      return this._parseModifierExpression(ref);
    } else if (this._t.currentCode === TokenCodes.ASSIGN) {
      return this._parseSetExpression(ref);
    }

    return this._parseGetExpression(ref);
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

  _parseGetExpression: function (refExpression) {
    return new GetExpression(refExpression);
  },

  /**
   */

  _parseSetExpression: function (refExpression) {
    this._t.next(); // eat =
    var value = this._parseExpression();
    return new SetExpression(refExpression, value);
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
    var cchar = this._t.current[1];
    this._t.next();

    return new OtherExpression(cchar);
  },

  /**
   */

  _parseParams: function () {
    this._t.next(); // eat (

    var ccode,
    params = [],
    param;

    while ((ccode = this._t.currentCode) !== TokenCodes.RP) {

      param = [];

      while (!(this._t.currentCode & (TokenCodes.COMA|TokenCodes.RP))) {
        param.push(this._parseExpression());
      }

      if (this._t.current[0] === TokenCodes.COMA) {
        this._t.next();
      }

      params.push(new ParamExpression(param));

    }

    this._t.next(); // eat )

    return params;
  }
});

module.exports = ScriptParser;