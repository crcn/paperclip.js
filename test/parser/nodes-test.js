var parser = require("../..//lib/parsers/default/parser"),
pc         = require("../../"),
assert     = require("assert"),
stringifyView = require("../utils/stringifyView");


describe(__filename + "#", function () {

  it("can parse a node without children", function () {
    parser.parse("<a />");
  });

  it("can parse the doctype", function () {
    var c = parser.parse("<!DOCTYPE html><a />");
  });

  it("doesn't maintain whitespace between two nodes", function () {
    var vnode = pc.template("<span>a</span>\n<span />").vnode;


    assert.equal(vnode.childNodes.length, 2);
    var vnode = pc.template("<br /> <br />").vnode;
    assert.equal(vnode.childNodes.length, 2);
  });

  it("maintains whitespace if text is after an element", function () {
    var vnode = pc.template("<span>a</span> b").vnode;
    assert.equal(vnode.childNodes[1].nodeValue, " b");
  });

  it("maintains spaces between blocks", function () {
    var vnode = pc.template("{{a}} {{b}}").vnode;
    assert.equal(vnode.childNodes.length, 3);
    var vnode = pc.template("{{a}} {{b}} c").vnode;
    assert.equal(vnode.childNodes.length, 4);
  });

  it("maintains whitespace if the space is a new line character", function () {
    var vnode = pc.template("{{a}}\n\t{{a}}").vnode;
    assert.equal(vnode.childNodes.length, 3);
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
    var tpl = pc.template("<span></span>\t <span></span> <!--a-->");

    assert.equal(stringifyView(tpl.view({})), "<span></span><span></span><!--a-->");
  });

  describe("bindings", function () {
    it("can parse text blocks", function () {
      var ast= parser.parse("aa {{abc}} bb");
    });

    it("trims whitespace from the start & end of elements", function () {
      var tpl = pc.template("<div> hello {{name}} </div>");
      assert.equal(stringifyView(tpl.view({ name: "john"})), "<div>hello john</div>");
    });

    it("maintains attribute spaces with a text binding", function () {
      var tpl = pc.template("<div class='blue red {{color}} yellow'></div>");
      assert.equal(stringifyView(tpl.view({ color: "blue" })), '<div class="blue red blue yellow"></div>');
    });

    it("preserves whitespace between nodes & text nodes", function () {
      var tpl = pc.template("<strong>hello</strong> world");
      assert.equal(stringifyView(tpl.view()), "<strong>hello</strong> world");
    });

    it("preserves whitespace between nodes & blocks", function () {
      var tpl = pc.template("<strong>hello</strong> {{name}}");
      assert.equal(stringifyView(tpl.view({name:"john"})), "<strong>hello</strong> john");
    });
  });
});
