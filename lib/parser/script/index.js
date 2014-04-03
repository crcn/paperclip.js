var BaseParser  = require("../base/parser"),
ScriptTokenizer = require("./tokenizer"),
TokenCodes      = ScriptTokenizer.codes;

var ReferenceExpression = require("./ast/reference"),
CallExpression          = require("./ast/call"),
OtherExpression         = require("./ast/other"),
ModifierExpression      = require("./ast/modifier"),
RootExpression          = require("./ast/root"),
GroupExpression         = require("./ast/group"),
GetExpression           = require("./ast/get"),
SetExpression           = require("./ast/set"),
ParamExpression         = require("./ast/param"),
ScriptExpression        = require("./ast/script"),
ObjectExpression        = require("./ast/object"),
StringExpression        = require("./ast/string");

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

      var name = this._t.current[1];

      var pn = this._t.peekNext();

      if (pn && pn[0] === TokenCodes.COLON) {
        this._t.next(); // eat name
        this._t.next(); // eat :
        expressions.push(new ScriptExpression(name, this._parseScriptExpression()));
      } else {
        expressions.push(new ScriptExpression("value", this._parseScriptExpression()));
      }
    }

    return new RootExpression(expressions);
  },

  /**
   */

  _parseScriptExpression: function () {
    var ccode, expressions = [];

    while ((ccode = this._t.currentCode) !== TokenCodes.COMA && ccode) {
      expressions.push(this._parsePipableExpression());
    }

    this._t.next(); // eat ,

    return new ParamExpression(expressions);
  },

  /**
   */

  _parsePipableExpression: function () {
    var expr = this._parseExpression();

    while (this._t.currentCode === TokenCodes.PIPE) {
      expr = this._parseModifierExpression(expr);
    }

    return expr;
  },

  /**
   */

  _parseExpression: function () {
    var ccode;

    if (!(ccode = this._t.currentCode)) return;

    if (ccode === TokenCodes.LP) {

      return this._parseGroupExpression();

    } else if (ccode === TokenCodes.LB) {
      return this._parseObjectExpression();

    } else if (~[TokenCodes.VAR, TokenCodes.TICK, TokenCodes.ASSIGN, TokenCodes.BT, TokenCodes.BF, TokenCodes.BFT].indexOf(ccode)) {
      return this._parseReferenceExpression();

    } else if (ccode === TokenCodes.NUMBER) {
      return this._parseNumberExpression();

    } else if (ccode === TokenCodes.NOT) {
      return this._parseNotExpression();
    } else if (ccode === TokenCodes.STRING) {
      return this._parseStringExpression();
    } else {
      return this._parseOtherExpression();
    }
  },

  /**
   */

  _parseStringExpression: function () {
    var value = this._t.current[1];
    this._t.next(); // eat it
    return new StringExpression(value);
  },

  /**
   */

  _parseGroupExpression: function () {
    return new GroupExpression(this._parseParams());
  },

  /**
   */

  _parseObjectExpression: function () {
    this._t.next(); // eat {

    var ccode, values = {};

    while ((ccode = this._t.currentCode) !== TokenCodes.RB && ccode) {
      var name = this._t.current[1];
      this._t.next(); // eat name
      this._t.next(); // eat colon
      values[name] = this._parseParamExpression();
    }

    this._t.next(); // eat }


    return new ObjectExpression(values);
  },

  /**
   * parses a.b.c
   */

  _parseReferenceExpression: function () {

    var isTick = this._t.currentCode === TokenCodes.TICK;

    var unbound = !!~[TokenCodes.TICK, TokenCodes.ASSIGN, TokenCodes.BT, TokenCodes.BF, TokenCodes.BFT].indexOf(this._t.currentCode),
    ccode;

    var bindType = this._t.currentCode;
    // console.log(bindType, unbound, TokenCodes.TICK, TokenCodes.ASSIGN, TokenCodes.BT, TokenCodes.BF, TokenCodes.BFT);


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

    if (unbound && isTick) {
      this._t.next(); // eat `
      ccode = this._t.currentCode;
    }

    var ref = new ReferenceExpression(path, bindType);


    // fn call
    if (ccode === TokenCodes.LP) {
      return this._parseCallExpression(ref);
    }


    if (this._t.currentCode === TokenCodes.ASSIGN) {
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
    var value = this._parsePipableExpression();
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

  _parseNotExpression: function () {
    this._t.next(); // eat !
    return new GroupExpression([new OtherExpression("!"), this._parsePipableExpression()])
  },

  /**
   */

  _parseOtherExpression: function () {

    var buffer = "";

    var noMatch = [TokenCodes.VAR,
    TokenCodes.COMA,
    TokenCodes.SEMI_COLON,
    TokenCodes.PIPE,
    TokenCodes.LP,
    TokenCodes.RP,
    TokenCodes.LB,
    TokenCodes.RB,
    TokenCodes.TICK,
    TokenCodes.QUOTE,
    TokenCodes.STRING,
    TokenCodes.NOT,
    TokenCodes.SQUOTE];

    while(!~noMatch.indexOf(this._t.currentCode) && this._t.currentCode) {
      buffer += this._t.current[1];
      this._t.next();
    }

    return new OtherExpression(buffer);
  },

  /**
   */

  _parseParams: function () {
    this._t.next(); // eat (

    var ccode,
    params = [];

    while ((ccode = this._t.currentCode) !== TokenCodes.RP) {
      params.push(this._parseParamExpression());
    }

    this._t.next(); // eat )

    return params;
  },

  /**
   */

  _parseParamExpression: function () {
    var param = [];

    while (!~[TokenCodes.COMA, TokenCodes.RP, TokenCodes.RB].indexOf(this._t.currentCode)) {
      param.push(this._parsePipableExpression());
    }

    if (this._t.current[0] === TokenCodes.COMA) {
      this._t.next();
    }

    return new ParamExpression(param);
  }
});

module.exports = ScriptParser;
