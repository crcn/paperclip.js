var BaseTokenizer = require("../base/tokenizer"),
utils = require("../utils");

var codes = utils.makeTokenCodes([
  "other"       , // ?
  "var"         , // boundVar
  "number"      , // 12345
  "string"      , // "string"
  "word"        , // world
  "ws"          , // \s\n\t\r
  "bool"        , // true/false
  "undef"       , // undefined
  "as"          , // as
  "or"          , // ||
  "assign"      , // =
  "eq"          , // ==
  "aeq"         , // ===
  "neq"         , // !=
  "aneq"        , // !==
  "not"         , // !
  "dollar"      , // $
  "lp"          , // (
  "rp"          , // )
  "coma"        , // ,
  "dot"         , // .
  "bs"          , // /
  "colon"       , // :
  "semi_colon"  , // ;
  "at"          , // @
  "lb"          , // {
  "pipe"        , // |
  "rb"          , // }
  "us"          , // _
  "tick"        , // `
  "bt"          , // =>  bind to
  "bf"          , // <=  bind from
  "bft"           // <=> bind from to
]);


var codeMap = {
  "="  : codes.ASSIGN,
  "$"  : codes.DOLLAR,
  "("  : codes.LP,
  ")"  : codes.RP,
  ","  : codes.COMA,
  "."  : codes.DOT,
  "/"  : codes.BS,
  ":"  : codes.COLON,
  ";"  : codes.SEMI_COLON,
  "@"  : codes.AT,
  "{"  : codes.LB,
  "|"  : codes.PIPE,
  "}"  : codes.RB,
  "_"  : codes.US,
  "`"  : codes.TICK
};


function ScriptTokenizer () {
  ScriptTokenizer.parent.call(this);
  this._s.skipWhitespace(true);
}

ScriptTokenizer.codes = codes;

BaseTokenizer.extend(ScriptTokenizer, {

  /**
   */

  _next: function () {
    var ccode = this._s.ccode(), cchar = this._s.cchar(), tcode;


    // var, or reserved word?
    if (this._s.isAZ() || ~[codes.DOLLAR, codes.AT, codes.US].indexOf(tcode = (codeMap[cchar] || codes.OTHER))) {

      var word = this._s.next(/[_$@a-zA-Z0-9]+/);

      if (/^(true|false)$/.test(word)) return this._t(codes.BOOL, word);
      if (/^(undefined|null)$/.test(word)) return this._t(codes.UNDEF, word);
      if (/^as$/.test(word)) return this._t(codes.AS, word);

      return this._t(codes.VAR, word);

    // "string"?
    } else if (ccode === 39 || ccode === 34) {

      this._s.skipWhitespace(false);

      var buffer = [], c;

      while ((c = this._s.nextChar()) && !this._s.eof()) {
        var cscode = this._s.ccode();

        // skip escape (\)
        if (cscode === 92) {
          buffer.push(this._s.nextChar());
          continue;
        }

        if (cscode === ccode) {
          break;
        }

        buffer.push(c);
      }

      this._s.skipWhitespace(true);

      return this._t(codes.STRING, buffer.join(""));

    // number?
    } else if (this._s.is09()) {
      return this._t(codes.NUMBER, this._s.next(/[0-9\.]+/))
    // !, !=, !==
    } else if (ccode === 33) {
      if (this._s.peek(2) === "!=") {
        this._s.skip(1);

        if (this._s.peek(2) === "==") {
          this._s.skip(1);
          return this._t(codes.ANEQ, "!==");
        }

        return this._t(codes.NEQ, "!=");
      } else {
        return this._t(codes.NOT, "!");
      }

    // =, ==, ===
    } else if (ccode === 61) {

      if (this._s.peek(2) === "=>") {
        this._s.skip(1);
        return this._t(codes.BT, "=>");
      }

      if (this._s.peek(2) === "==") {
        this._s.skip(1);

        if (this._s.peek(2) === "==") {
          this._s.skip(1);
          return this._t(codes.AEQ, "===");
        }

        return this._t(codes.EQ, "==");
      } else {
        return this._t(codes.ASSIGN, "=");
      }
    } else if (ccode === 60) {
      if (this._s.peek(3) === "<=>") {
        this._s.skip(2);
        return this._t(codes.BFT, "<=>")
      }
      if (this._s.peek(2) === "<=") {
        this._s.skip(1);
        return this._t(codes.BF, "<=");
      }
    // ||
    } else if (ccode === 124 && this._s.peek(2) === "||") {
      this._s.skip(1);
      return this._t(codes.OR, "||");
    }


    // everything else
    return this._t(tcode, cchar);
  }

});


module.exports = ScriptTokenizer;
