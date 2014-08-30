var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js");

describe("parser/script#", function () {


  describe("references", function () {

  });

  describe("scripts", function () {
    it("automatically assigns value script", function () {
        var ast = parser.parse("{{ a }}")[0];
        expect(ast.scripts.value.value).to.be("a");
    });

    it("properly parses scripts", function () {
        var ast = parser.parse("{{ a:b, c:d, e:f}}")[0];
        expect(ast.scripts.a.value).to.be("b");
        expect(ast.scripts.c.value).to.be("d");
        expect(ast.scripts.e.value).to.be("f");
    });
  });

  describe("objects", function () {
    it("can have different types of keys", function () {
        var ast = parser.parse("{{{ a:b, 'c':d, \"e\":'f'} }}")[0];
        expect(ast.scripts.value.value[0].key).to.be("a");
        expect(ast.scripts.value.value[1].key).to.be("c");
        expect(ast.scripts.value.value[2].key).to.be("e");
    });
  });

  describe("numbers", function () {
    it("can parse an integer", function () {
      expect((parser.parse("{{ 55 }}")[0].scripts.value.value)).to.be(55);
    });

    it("can parse a floating point", function () {
      expect((parser.parse("{{ .5 }}")[0].scripts.value.value)).to.be(.5);
      expect((parser.parse("{{ 333.509 }}")[0].scripts.value.value)).to.be(333.509);
    });

    it("can parse a negative values", function () {
      expect((parser.parse("{{ -.5 }}")[0].scripts.value.value)).to.be(-.5);
      expect((parser.parse("{{ -333.509 }}")[0].scripts.value.value)).to.be(-333.509);
    });

  });


  describe("operators", function () {
    it("can add ")
  });
});
