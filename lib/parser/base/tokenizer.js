var protoclass = require("protoclass"),
strscan        = require("strscanner");

function BaseTokenizer () {
  this._s    = strscan("", { skipWhitespace: true });
  this._pool = [];
}

protoclass(BaseTokenizer, {

  /**
   */

  source: function (value) {
    if (!arguments.length) return this._source;
    this._s.source(this._source = value);
  },

  /**
   */

  skipWhitespace: function (value) {
    if (!arguments.length) return this._s.skipWhitespace();
    this._s.skipWhitespace(value);
  },

  /**
   */

  peekNext: function () {
    var c = this.current, cc = this.currentCode;
    next = this.next();
    this.putBack();
    this.current = c;
    this.currentCode = cc;
    return next;
  },

  /**
   */

  putBack: function () {
    if (this.current) {
      this._pool.push(this.current);
    }
  },

  /**
   */

  _current: function (value) {
    this.current = value;

    if (value) {
      this.currentCode = value[0];
    } else {
      this.currentCode = null;
    }

    return value;
  },

  /**
   */

  next: function () {
    if (this._pool.length) return this._current(this._pool.pop());
    if (this._s.eof()) return this._current(void 0);

    return this._current(this._next() || this._t(-1, this._s.cchar()));
  },

  /**
   */

  _next: function () {
    // OVERRIDE ME
  },


  /**
   */

  _t: function (code,value) {
    var p = this._s.pos(), r = this._s.row(), c = this._s.column();
    this._s.nextChar();
    return this.current = [code, value, p, r, c];
  }
});

module.exports = BaseTokenizer;