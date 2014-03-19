var protoclass = require("protoclass");

function BaseParser (tokenizer) {
  this._t = tokenizer;
}

protoclass(BaseParser, {

  /**
   */

  parse: function (source) {
    this._source = source;
    this._t.source(source);
    return this._parse();
  },

  /**
   */

  _parse: function () {
    // OVERRIDE ME
  }
});

module.exports = BaseParser;