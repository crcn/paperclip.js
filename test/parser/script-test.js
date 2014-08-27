var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js");

describe("parser/script#", function () {

  it("can parse an object", function () {
    var ast = parser.parse("text{{{a:b,c:d,'e':f}}}");
    console.log(JSON.stringify(ast[1], null, 2));
    expect(ast[1].type).to.be("binding");
  });
});

