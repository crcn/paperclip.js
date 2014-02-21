var BaseTokenizer = require("../base/tokenizer"),
utils = require("../utils");

var codes = utils.makeTokenCodes([
  "lt"      ,  // <
  "gt"      ,  // >     
  "word"    ,  // WORD
  "eq"      ,  // =
  "string"  ,  // "WORD",
  "sn"      ,  // OTHER
  "slgt"    ,  // />
  "ltsl"    ,  // </
  "bs"      ,  // /
  "ws"      ,
  "pound"   ,  // #
  "script"  ,  // {{ script }}
  "bscript" ,  // {{#block}}{{/}}
  "escript" ,  // {{/}}
  "qoute"   ,  // "
  "sqoute"  ,  // '
  "char"    ,  // anything else
]);

var codeMap = {
  "="  : codes.EQ,
  "#"  : codes.POUND,
  "/"  : codes.BS,
  "'"  : codes.SQOUTE,
  "\"" : codes.QUOTE
};


function XMLTokenizer () {
  XMLTokenizer.parent.call(this);
  this._s.skipWhitespace(false);
}

XMLTokenizer.codes = codes;

var regexp = {
  word: /[$_\-a-zA-Z0-9]+/
}


BaseTokenizer.extend(XMLTokenizer, {

  /**
   */

  _next: function () {

    if (this._s.isAZ()) {
      return this._t(codes.WORD, this._s.next(regexp.word))
    }

    var cchar, code;

    if ((cchar = this._s.cchar()) === "<") {

      // <!-- comment -->
      if (this._s.peek(4) === "<!--") {
        this._s.next(/<!--.*?-->/);
        return this._next();

      // doctype
      } else if (this._s.peek(2) === "<!") {
        return this._t(codes.SN, this._s.next(/<!.*?>/));

      // </
      } else if (this._s.peek(2) === "</") {
        this._s.skip(1); // eat </
        return this._t(codes.LTSL, "</");

      // <
      } else {
        return this._t(codes.LT, "<");
      }

    } else if (cchar === "/") {

      // />
      if (this._s.peek(2) === "/>") {
        this._s.skip(1);
        return this._t(codes.SLGT, "/>");

      // /
      } else {
        return this._t(codes.BS, "/");
      }

    } else if (cchar == ">") {
      return this._t(codes.GT, ">");

    // whitespace
    } else if (this._s.isWs()) {
      this._s.next(/[\s\r\n\t]+/);
      return this._t(codes.WS, " ");

    // embedded script
    } else if (this._s.peek(2) === "{{") {
      this._s.skip(2); // eat {
      this._s.skipWs(true); 

      var code;
      if (this._s.peek(1) === "#") {
        this._s.skip(1); // eat #
        code = codes.BSCRIPT;
      } else if (this._s.peek(1) === "/") {
        this._s.skip(1);
        code = codes.ESCRIPT;
      } else {
        code = codes.SCRIPT;

      }

      var script = this._s.next(/.*}}/).replace(/\s*}}$/, "");

      return this._t(code, script.length ? script : undefined);

    // mustache end }}
    } else if (this._s.peek(2) === "}}") {
      this._s.skip(1);
      return this._t(codes.EM, "}}");

    // other codes
    } else if (code = codeMap[cchar]) {
      return this._t(code, cchar);
    }

    return this._t(codes.CHAR, this._s.cchar());
  }
});

module.exports = XMLTokenizer;