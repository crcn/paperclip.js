var parser = require("../..//lib/parsers/default/parser");
var expect = require("expect.js");

function _find(exprName, exprs, results) {
  if (Object.prototype.toString.call(exprs) !== "[object Array]") return;
  if (!results) results = [];
  if (exprs[0] === exprName) results.push(exprs);
  for (var i = exprs.length; i--;) {
    _find(exprName, exprs[i], results);
  }
  return results;
}

describe(__filename + "#", function() {

  describe("tags", function() {

    it("can be parsed", function() {
      var expr = parser.parse("<div></div>");
      expect(expr[0][0]).to.be("element");
      expect(expr[0][1]).to.be("div");
      expect(expr[0][2].length).to.be(0);
      expect(expr[0][3].length).to.be(0);
    });

    it("doesn't maintain whitespace between two elements", function() {
      var expr = parser.parse("<span /> <span />");
      expect(_find("text", expr).length).to.be(0);
      expect(expr.length).to.be(2);
    });

    describe("attributes", function() {
      it("can be created with a value in single quotes", function() {
        var expr = parser.parse("<div id=\"test\"></div>");
        expect(expr[0][0]).to.be("element");
        expect(expr[0][1]).to.be("div");
        expect(expr[0][2][0][0]).to.be("attribute");
        expect(expr[0][2][0][1]).to.be("id");
        expect(expr[0][2][0][2][0][1]).to.be("test");
        expect(expr[0][3].length).to.be(0);
      });

      it("can be created with a value in double quotes", function() {
        var expr = parser.parse("<div id=\"test\"></div>");
        expect(expr[0][0]).to.be("element");
        expect(expr[0][1]).to.be("div");
        expect(expr[0][2][0][0]).to.be("attribute");
        expect(expr[0][2][0][1]).to.be("id");
        expect(expr[0][2][0][2][0][1]).to.be("test");
        expect(expr[0][3].length).to.be(0);
      });

      it("can be created without a value", function() {
        var expr = parser.parse("<div attr></div>");
        expect(expr[0][0]).to.be("element");
        expect(expr[0][1]).to.be("div");
        expect(expr[0][2][0][0]).to.be("attribute");
        expect(expr[0][2][0][1]).to.be("attr");
        expect(expr[0][2][0][2].length).to.be(0);
      });

      it("can be created with multiple attributes", function() {
        var expr = parser.parse("<div a='1' b='2'></div>");
        expect(_find("attribute", expr).length).to.be(2);
      });

      it("busts if there is a tag mismatch", function() {
        var err;

        try {
          var expr = parser.parse("<div></span>");
        } catch (e) {
          err = e;
        }

        expect(err.message).to.be("Expected </div> but \"<\" found.");
      });

      it("can be created without an end tag", function() {
        var expr = parser.parse("<div />");
        expect(expr[0][0]).to.be("element");
        expect(expr[0][1]).to.be("div");
      });

      // TODO - set property here
      it("sets a dynamic block as an property of an element if quotes are omitted", function() {
        var expr = parser.parse("<div class={{something}} />");
        expect(expr[0][2][0][0]).to.be("property");
        expect(expr[0][2][0][1]).to.be("class");
        expect(expr[0][2][0][2][0]).to.be("script");
      });

      // TODO - identify as setAttribute here
      it("can contain a block expression with quotes", function() {
        var expr = parser.parse("<div class=\"{{something}}\" />");
        expect(expr[0][2][0][2].length).to.be(1);
        expect(expr[0][2][0][2][0][0]).to.be("script");
        expect(expr[0][2][0][2][0][1][0]).to.be("reference");
        expect(expr[0][2][0][2][0][0]).to.be("script");
      });

      it("can mix attribute strings with blocks", function() {
        var expr = parser.parse("<div class=\"{{a}}-{{b}}\" />");
        expect(expr[0][2][0][2].length).to.be(3);
        expect(expr[0][2][0][2][1][0]).to.be("string");
      });
    });

    describe("children", function() {
      it("can be created with one child", function() {
        var expr = parser.parse("<div><span /></div>");
        expect(expr[0][0]).to.be("element");
        expect(expr[0][3][0][0]).to.be("element");
        expect(expr[0][3][0][1]).to.be("span");
      });
      it("can add a text node", function() {
        var expr = parser.parse("<div>hello</div>");
        expect(expr[0][3][0][0]).to.be("text");
        expect(expr[0][3][0][1]).to.be("hello");
      });
    });

    describe("void", function() {
      [
        "area",
        "base",
        "br",
        "col",
        "command",
        "embed",
        "hr",
        "img",
        "input",
        "keygen",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr"
      ].forEach(function(tagName) {

        it("properly parses a void element without children", function() {
          var expr = parser.parse("<" + tagName + ">");
          expect(expr.length).to.be(1);
          expect(expr[0][0]).to.be("element");
          expect(expr[0][1]).to.be(tagName);
        });

        it("properly parses a void element with a closing tag", function() {
          var expr = parser.parse("<" + tagName + " />");
          expect(expr.length).to.be(1);
          expect(expr[0][0]).to.be("element");
          expect(expr[0][1]).to.be(tagName);
        });
      });
    });

    describe("text", function() {
      it("maintians whitespace after an element with children", function() {
        var expr = parser.parse("<span>a</span> b");
        expect(expr[1][0]).to.be("text");
        expect(expr[1][1]).to.be(" b");
      });

      it("maintians whitespace after a void element", function() {
        var expr = parser.parse("<img> b");
        expect(expr[1][0]).to.be("text");
        expect(expr[1][1]).to.be(" b");
      });

      it("replaces new line characters with spaces", function() {
        var expr = parser.parse("\n\ra");
        expect(expr[0][0]).to.be("text");
        expect(expr[0][1]).to.be(" a");
      });

      it("maintains a space before an element", function() {
        var expr = parser.parse("b <img>");
        expect(expr[0][0]).to.be("text");
        expect(expr[0][1]).to.be("b ");
      });
    });

    describe("comments", function() {
      it("can be parsed", function() {
        var expr = parser.parse("<!--hello-->");
        expect(expr[0][0]).to.be("comment");
        expect(expr[0][1]).to.be("hello");
      });

      it("can be added before an element", function() {
        var expr = parser.parse("<!--hello--> <img>");
        expect(expr[0][0]).to.be("comment");
        expect(expr[0][1]).to.be("hello");
        expect(expr[1][0]).to.be("element");
        expect(expr[1][1]).to.be("img");
      });

      it("can be added before a text node", function() {
        var expr = parser.parse("<!--hello--> abba");
        expect(expr[0][0]).to.be("comment");
        expect(expr[0][1]).to.be("hello");
        expect(expr[1][0]).to.be("text");
        expect(expr[1][1]).to.be("abba");
      });
    });
  });

  describe("blocks", function() {
    it("can be parsed", function() {
      var expr = parser.parse("{{a}}");
      expect(expr[0][0]).to.be("block");
    });

    describe("operators", function() {
      [
        "&&",
        "||",
        "===",
        "==",
        "!==",
        "!=",
        ">==",
        ">=",
        ">",
        "<==",
        "<=",
        "<",
        "+",
        "-",
        "%",
        "*",
        "/"
      ].forEach(function(op) {
        it("can parse " + op, function() {
          var expr = parser.parse("{{a" + op + "b}}");
          expect(expr[0][1][0]).to.be("operator");
          expect(expr[0][1][1]).to.be(op);
        });
      });
    });

    describe("binding operators", function() {
      [
        "~",
        "<~",
        "<~>",
        "~>"
      ].forEach(function(op) {
        it("can parse" + op, function() {
          var expr = parser.parse("{{" + op + "a}}");
          expect(expr[0][1][0]).to.be("reference");
          expect(expr[0][1][1][0]).to.be("a");
          expect(expr[0][1][2]).to.be(op);
        });
      });
    });

    it("can parse =", function() {
      var expr = parser.parse("{{a=b}}");
      expect(expr[0][1][0]).to.be("assign");
    });

    it("can parse chained =", function() {
      var expr = parser.parse("{{a=b=c=d}}");
      expect(expr[0][1][0]).to.be("assign");
    });

    it("can parse deep refs", function() {
      var expr = parser.parse("{{a.b.c.d}}");
      expect(expr[0][1][0]).to.be("reference");
      expect(expr[0][1][1][0]).to.be("a");
      expect(expr[0][1][1][1]).to.be("b");
      expect(expr[0][1][1][2]).to.be("c");
    });

    it("can parse ternary expressions", function() {
      var expr = parser.parse("{{a?b:c}}");
      expect(expr[0][1][0]).to.be("condition");
      expect(expr[0][1][1][0]).to.be("reference");
    });

    it("can parse !", function() {
      var expr = parser.parse("{{!a}}");
      expect(expr[0][1][0]).to.be("not");
      expect(expr[0][1][1][0]).to.be("reference");
    });

    it("can parse !!!", function() {
      var expr = parser.parse("{{!!!a}}");
      expect(expr[0][1][0]).to.be("not");
      expect(expr[0][1][1][0]).to.be("not");
      expect(expr[0][1][1][1][0]).to.be("not");
    });

    it("can parse negative", function() {
      var expr = parser.parse("{{-a}}");
      expect(expr[0][1][0]).to.be("negative");
    });

    describe("function calls", function() {
      it("can be parsed", function() {
        var expr = parser.parse("{{a.b()}}");
        expect(expr[0][1][0]).to.be("call");
        expect(expr[0][1][1][1][0]).to.be("a");
      });
    });

    it("can parse modifiers", function() {
      var expr = parser.parse("{{a|b|c}}");
      expect(expr[0][1][0]).to.be("modifier");
      expect(expr[0][1][1]).to.be("c");
    });

    it("can parse integers", function() {
      var expr = parser.parse("{{1234}}");
      expect(expr[0][1][0]).to.be("literal");
    });

    it("can parse floats", function() {
      var expr = parser.parse("{{1.2345}}");
      expect(expr[0][1][0]).to.be("literal");
      expect(expr[0][1][1]).to.be(1.2345);
    });

    it("can parse strings", function() {
      var expr = parser.parse("{{'abc'}}");
      expect(expr[0][1][0]).to.be("string");
      expect(expr[0][1][1]).to.be("abc");
    });

    describe("reserved keyword", function() {
      [
        "Infinity",
        "undefined",
        "null",
        "true",
        "false"
      ].forEach(function(reserved) {
        it(reserved + " can be parsed", function() {
          var expr = parser.parse("{{" + reserved + "}}");
          expect(expr[0][1][0]).to.be("literal");
        });
      });
    });

    it("can parse a (group)", function() {
      var expr = parser.parse("a+(b-c)");

    });
  });

  describe("doctype", function() {
    it("can be parsed", function() {
      var expr = parser.parse("<!DOCTYPE html>");
      expect(expr[0][0]).to.be("doctype");
    });
  });
});
