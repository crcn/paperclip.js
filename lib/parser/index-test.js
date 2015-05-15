var parser = require("./index");
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
  it("properly returns the root expression", function() {
    var expr = parser.parse("hello");
    expect(expr.length).to.be(2);
    expect(expr[0]).to.be("root");
    expect(expr[1][0]).to.be("text");
    expect(expr[1][1]).to.be("hello");
  });

  describe("tags", function() {

    it("can be parsed", function() {
      var expr = parser.parse("<div></div>");
      expect(expr[1][0]).to.be("element");
      expect(expr[1][1]).to.be("div");
      expect(expr[1][2].length).to.be(0);
      expect(expr[1][3].length).to.be(0);
    });

    describe("attributes", function() {
      it("can be created with a value in single quotes", function() {
        var expr = parser.parse("<div id='test'></div>");
        expect(expr[1][0]).to.be("element");
        expect(expr[1][1]).to.be("div");
        expect(expr[1][2][0][0]).to.be('attribute');
        expect(expr[1][2][0][1]).to.be('id');
        expect(expr[1][2][0][2][0]).to.be('test');
        expect(expr[1][3].length).to.be(0);
      });

      it("can be created with a value in double quotes", function() {
        var expr = parser.parse("<div id=\"test\"></div>");
        expect(expr[1][0]).to.be("element");
        expect(expr[1][1]).to.be("div");
        expect(expr[1][2][0][0]).to.be('attribute');
        expect(expr[1][2][0][1]).to.be('id');
        expect(expr[1][2][0][2][0]).to.be('test');
        expect(expr[1][3].length).to.be(0);
      });

      it("can be created without a value", function() {
        var expr = parser.parse("<div attr></div>");
        expect(expr[1][0]).to.be("element");
        expect(expr[1][1]).to.be("div");
        expect(expr[1][2][0][0]).to.be('attribute');
        expect(expr[1][2][0][1]).to.be('attr');
        expect(expr[1][2][0][2].length).to.be(0);
      });

      it("can be created with multiple attributes", function() {
        var expr = parser.parse("<div a='1' b='2'></div>");
        expect(_find("attribute", expr).length).to.be(2);
      });
    });

    describe("children", function() {

    });


    describe("void", function() {
      ["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"].forEach(function(tagName) {

        it("properly parses a void element without children", function() {
          var expr = parser.parse("<" + tagName + ">");
          expect(expr.length).to.be(2);
          expect(expr[0]).to.be("root");
          expect(expr[1][0]).to.be("element");
          expect(expr[1][1]).to.be(tagName);
        });

        it("properly parses a void element with a closing tag", function() {
          var expr = parser.parse("<" + tagName + " />");
          expect(expr.length).to.be(2);
          expect(expr[0]).to.be("root");
          expect(expr[1][0]).to.be("element");
          expect(expr[1][1]).to.be(tagName);
        });
      });
    });
  });



});
