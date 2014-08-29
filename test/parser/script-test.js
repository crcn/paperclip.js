var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js");

describe("parser/script#", function () {

  it("can parse an object", function () {
    var ast = parser.parse("text{{{a:b,c:d,'e':f}}}");
    expect(ast[1].type).to.be("binding");
  });
});
