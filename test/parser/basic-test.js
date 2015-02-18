var parser = require("../../lib/parser"),
template   = require("../../lib/template"),
expect     = require("expect.js");

describe(__filename + "#", function () {

  it("can properly parse a tpl", function () {
    parser.parse("a");
  });

});