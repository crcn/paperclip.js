var parser = require("../../lib/parser/parser.js"),
template   = require("../../lib/template"),
assert     = require("assert");


describe(__filename + "#", function () {

  it("can parse a node without children", function () {
    parser.parse("<a />");
  });

  it("can parse the doctype", function () {
    var c = parser.parse("<!DOCTYPE html><a />");
  });

  it("doesn't maintain whitespace between two nodes", function () {
    var ast = parser.parse("<span>a</span>\n<span />");
    assert.equal(ast.childNodes.expressions.expressions.length, 2);
    ast = parser.parse("<br /> <br />")
    assert.equal(ast.childNodes.expressions.expressions.length, 2);
  });

  it("maintains whitespace if text is after an element", function () {
    var ast = parser.parse("<span>a</span> b");
    assert.equal(ast.childNodes.expressions.expressions[1].value, " b");
  });

  it("maintains spaces between blocks", function () {
    var ast = parser.parse("{{a}} {{b}}");
    assert.equal(ast.childNodes.expressions.expressions.length, 3);
    var ast = parser.parse("{{a}} {{b}} c");
    assert.equal(ast.childNodes.expressions.expressions.length, 4);
  });

  it("maintains whitespace if the space is a new line character", function () {
    var ast = parser.parse("{{a}}\n\t{{a}}");
    assert.equal(ast.childNodes.expressions.expressions.length, 3);
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
      assert.equal(e.message, "Expected </a> but \"<\" found.");
    }
  });

  it("can parse a node with a closing tag", function () {
    parser.parse("<a></a>");
  });

  it("can parse node attributes without values", function () {
    var ast = parser.parse("<a a b />");
  });

  it("can parse node attributes with values", function () {
    parser.parse("<a b=\"c\" d='e' />");

  });

  it("can parse node attributes with ws", function () {
    parser.parse("<a b = \"c\" d\t\n='e' />");
  });

  it("can parse a node with children", function () {
    var ast = parser.parse("<a><b></b></a>");
  });

  it("can parse text", function () {
    var ast = parser.parse("abcde");
  });

  it("can parse text with a node", function () {
    var ast = parser.parse("abcde<a></a>");
  });

  it("can parse comments", function () {
    var ast = parser.parse("<!-- hello -->");
  });


  it("doesn't maintain whitespace between comments", function () {
    var tpl = template("<span></span>\t <span></span> <!--a-->");
    assert.equal(tpl.view().toString(), "<span></span><span></span><!--a-->");
  });

  describe("bindings", function () {
    it("can parse text blocks", function () {
      var ast= parser.parse("aa {{abc}} bb");
    });

    it("can parse binding blocks", function () {
      var ast = parser.parse("{{#a}} 123 {{/}}");
    });

    it("can parse binding blocks with children", function () {
      var ast = parser.parse("{{#a}}123{{/b}}456{{/c}}789{{/}}");
    });

    it("can parse bindings within attribute values", function () {
      var ast = parser.parse("<input data-bind='{{model:<~>name}}'></input>");
    });

    it("can parse attribute values as bindings", function () {
      var ast = parser.parse("<input data-bind={{model:<~>name}} />");
    });

    it("can parse bindings and text within attrbutes", function () {
      var ast = parser.parse("<input value='hello {{firstName}} {{lastName}}'></input>");


      var fs = require("fs");

      try {
        var ast = parser.parse(fs.readFileSync(__dirname + "/test.pc", "utf8"));
        // console.log(JSON.stringify(ast, null, 2));
      } catch (e) {
        // console.log(e);
      }
    });


    it("trims whitespace from the start & end of elements", function () {
      var tpl = template("<div> hello {{name}} </div>");
      assert.equal(tpl.view({ name: "john"}).toString(), "<div>hello john</div>");
    });

    it("maintains attribute spaces with a text binding", function () {
      var tpl = template("<div class='blue red {{color}} yellow'></div>");
      assert.equal(tpl.view({ color: "blue" }).toString(), '<div class="blue red blue yellow"></div>');
    });

    it("preserves whitespace between nodes & text nodes", function () {
      var tpl = template("<strong>hello</strong> world");
      assert.equal(tpl.view().toString(), "<strong>hello</strong> world");
    });

    it("preserves whitespace between nodes & blocks", function () {
      var tpl = template("<strong>hello</strong> {{name}}");
      assert.equal(tpl.view({name:"john"}).toString(), "<strong>hello</strong> john");
    });

  });
});
