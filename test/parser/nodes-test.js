var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js");

describe("parser#", function () {

  it("can parse a node without children", function () {
    parser.parse("<a>");
  });

  it("fails if there is a closing tag without an open tag", function () {
    try {
      parser.parse("<a></b>");
    } catch (e) {
      expect(e.message).to.be("Expected </a> but \"<\" found.");
    }
  })

  it("can parse a node with a closing tag", function () {
    parser.parse("<a></a>");
  });

  it("can parse a node with attributes", function () {
    parser.parse("<a b='c'>");
  });
});

