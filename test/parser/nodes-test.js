var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js");

describe("parser/node#", function () {

  it("can parse a node without children", function () {
    parser.parse("<a />");
  });

  it("can parse the doctype", function () {
    var c = parser.parse("<!DOCTYPE html><a />").childNodes;
    expect(c.length).to.be(2);
    expect(c[0].value).to.be("html")
  });

  it("accepts many types of characters in the tag name", function () {
    parser.parse("<a />");
    parser.parse("<h3 />");
    parser.parse("<a_v />");
    parser.parse("<a:n />");
  });

  it("can parse a node an end statement", function () {
    parser.parse("<a />");
    parser.parse("<a b='c' />");
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
    var ast = parser.parse("<a a b />").childNodes[0];
    expect(ast.name).to.be("a");
    expect(ast.attributes[0].name).to.be("a");
    expect(ast.attributes[0].value).to.be(void 0);
  });

  it("can parse node attributes with values", function () {
    parser.parse("<a b=\"c\" d='e' />").childNodes[0];
  });

  it("can parse node attributes with ws", function () {
    parser.parse("<a b = \"c\" d\t\n='e' />").childNodes[0];
  });

  it("can parse a node with children", function () {
    var ast = parser.parse("<a><b></b></a>").childNodes[0];
    expect(ast.type).to.be("elementNode");
    expect(ast.childNodes[0].name).to.be("b");
  });

  it("can parse text", function () {
    var ast = parser.parse("abcde").childNodes[0];
    expect(ast.type).to.be("textNode");
    expect(ast.value).to.be("abcde");
  });

  it("can parse text with a node", function () {
    var ast = parser.parse("abcde<a></a>").childNodes;
    expect(ast[0].type).to.be("textNode");
    expect(ast[0].value).to.be("abcde");
    expect(ast[1].type).to.be("elementNode");
    expect(ast[1].name).to.be("a");
  });

  it("can parse comments", function () {
    var ast = parser.parse("<!-- hello -->").childNodes;
    expect(ast[0].value).to.be(" hello ");
  });

  describe("bindings", function () {
    it("can parse text blocks", function () {
      var ast= parser.parse("aa {{abc}} bb").childNodes;
      expect(ast[1].type).to.be("binding");
    });

    it("can parse binding blocks", function () {
      var ast = parser.parse("{{#a}} 123 {{/}}").childNodes[0];
      expect(ast.type).to.be("blockBinding");
      expect(ast.childNodes[0].type).to.be("textNode");
    });

    it("can parse binding blocks with children", function () {
      var ast = parser.parse("{{#a}}123{{/b}}456{{/c}}789{{/}}").childNodes[0];
      expect(ast.type).to.be("blockBinding");
      expect(ast.childNodes[0].value).to.be("123");
      expect(ast.childBlock.type).to.be("blockBinding");
      expect(ast.childBlock.childNodes[0].value).to.be("456");
      expect(ast.childBlock.childBlock.type).to.be("blockBinding");
      expect(ast.childBlock.childBlock.childNodes[0].value).to.be("789");
    });

    it("can parse bindings within attribute values", function () {
      var ast = parser.parse("<input data-bind='{{model:<~>name}}'></input>").childNodes[0];
      expect(ast.attributes[0].value.type).to.be("binding");
    });

    it("can parse attribute values as bindings", function () {
      var ast = parser.parse("<input data-bind={{model:<~>name}} />").childNodes[0];
      expect(ast.attributes[0].value.type).to.be("binding");
    });

    it("can parse bindings and text within attrbutes", function () {
      var ast = parser.parse("<input value='hello {{firstName}} {{lastName}}'></input>").childNodes[0];
      expect(ast.attributes[0].value[0]).to.be("hello ");
      expect(ast.attributes[0].value[1].type).to.be("binding");
      expect(ast.attributes[0].value[2]).to.be(" ");
      expect(ast.attributes[0].value[3].type).to.be("binding");

      
      var fs = require("fs");

      try {
        var ast = parser.parse(fs.readFileSync(__dirname + "/test.pc", "utf8"));
        // console.log(JSON.stringify(ast, null, 2));
      } catch (e) {
        console.log(e);
      }
    });
  });
});
