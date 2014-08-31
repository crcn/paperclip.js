var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js");

describe("parser/node#", function () {

  it("can parse a node without children", function () {
    parser.parse("<a>");
  });

  it("accepts many types of characters in the tag name", function () {
    parser.parse("<a>");
    parser.parse("<h3>");
    parser.parse("<a_v>");
    parser.parse("<a:n>");
  });

  it("can parse a node an end statement", function () {
    parser.parse("<a />");
  });

  it("fails if there is a closing tag without an open tag", function () {
    try {
      parser.parse("<a></b>");
    } catch (e) {
      expect(e.message).to.be("Expected </a> but \"<\" found.");
    }
  });

  it("can parse a node with a closing tag", function () {
    parser.parse("<a></a>");
  });

  it("can parse node attributes without values", function () {
    var ast = parser.parse("<a a b>")[0];
    expect(ast.name).to.be("a");
    expect(ast.attributes[0].name).to.be("a");
    expect(ast.attributes[0].value).to.be(void 0);
  });

  it("can parse node attributes with values", function () {
    parser.parse("<a b=\"c\" d='e'>")[0];
  });

  it("can parse a node with children", function () {
    var ast = parser.parse("<a><b></b></a>")[0];
    expect(ast.type).to.be("elementNode");
    expect(ast.children[0].name).to.be("b");
  });

  it("can parse text", function () {
    var ast = parser.parse("abcde")[0];
    expect(ast.type).to.be("textNode");
    expect(ast.value).to.be("abcde");
  });

  it("can parse text with a node", function () {
    var ast = parser.parse("abcde<a></a>");
    expect(ast[0].type).to.be("textNode");
    expect(ast[0].value).to.be("abcde");
    expect(ast[1].type).to.be("elementNode");
    expect(ast[1].name).to.be("a");
  });

  it("can parse comments", function () {
    var ast = parser.parse("<!-- hello -->");
    expect(ast[0].value).to.be(" hello ");
  });

  describe("bindings", function () {
    it("can parse text blocks", function () {
      var ast= parser.parse("aa {{abc}} bb");
      expect(ast[1].type).to.be("binding");
    });

    it("can parse binding blocks", function () {
      var ast = parser.parse("{{#a}} 123 {{/}}")[0];
      expect(ast.type).to.be("bindingBlock");
      expect(ast.fragment[0].type).to.be("textNode");
    });

    it("can parse binding blocks with children", function () {
      var ast = parser.parse("{{#a}}123{{/b}}456{{/c}}789{{/}}")[0];
      expect(ast.type).to.be("bindingBlock");
      expect(ast.fragment[0].value).to.be("123");
      expect(ast.child.type).to.be("bindingBlock");
      expect(ast.child.fragment[0].value).to.be("456");
      expect(ast.child.child.type).to.be("bindingBlock");
      expect(ast.child.child.fragment[0].value).to.be("789");
    });

    it("can parse bindings within attribute values", function () {
      var ast = parser.parse("<input data-bind='{{model:<~>name}}'></input>")[0];
      expect(ast.attributes[0].value[0].type).to.be("binding");
    });

    it("can parse bindings and text within attrbutes", function () {
      var ast = parser.parse("<input value='hello {{firstName}} {{lastName}}'></input>")[0];
      expect(ast.attributes[0].value[0]).to.be("hello ");
      expect(ast.attributes[0].value[1].type).to.be("binding");
      expect(ast.attributes[0].value[2]).to.be(" ");
      expect(ast.attributes[0].value[3].type).to.be("binding");
    });
  });
});
