var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js"),
pc         = require("../.."),
bindable   = require("bindable");

describe("parser/node#", function () {

  it("can parse a node without children", function () {
    parser.parse("<a />");
  });

  it("can parse the doctype", function () {
    var c = parser.parse("<!DOCTYPE html><a />");
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
        console.log(e);
      }
    });

    it("trims whitespace from attributes", function () {
      var tpl = pc.template("<input value=' {{name}}'></input>");
      expect(tpl.bind(new bindable.Object({ name: "john"})).toString()).to.be('<input value="john">');
    });

    it("trims whitespace from the start & end of elements", function () {
      var tpl = pc.template("<div> hello {{name}} </div>");
      expect(tpl.bind(new bindable.Object({ name: "john"})).toString()).to.be("<div>hello john</div>");
    });

    it("maintains attribute spaces with a text binding", function () {
      var tpl = pc.template("<div class='blue red {{color}} yellow'></div>");
      expect(tpl.bind(new bindable.Object({ color: "blue" })).toString()).to.be('<div class="blue red blue yellow"></div>');
    });

    it("can data-bind unregistered atts", function () {
      var tpl = pc.template("{{_id:'aa'}}").bind(new bindable.Object());
      expect(tpl.bindings.clip.get("_id")).to.be("aa");
    });

    it("can set value: to the first arg if it's not there", function () {
      var tpl = pc.template("{{name,_id:'aa',_id2:'aaa'}}").bind(new bindable.Object());
      expect(tpl.bindings.clip.get("_id")).to.be("aa");
    });

    it("can reference bindings from data-bind", function () {
      var tpl = pc.template("<div data-bind={{name,_id:'aa',_id2:'aaa'}}></div>").bind(new bindable.Object({name:"john"}));
      expect(tpl.bindings.clip.get("_id")).to.be("aa");
      expect(tpl.bindings.clip.get("_id2")).to.be("aaa");
      expect(tpl.bindings.clip.get("value")).to.be("john");
    });

    it("can reference bindings from any attribute", function () {
      var tpl = pc.template("<div class={{name,_id:'aa',_id2:'aaa'}}></div>").bind(new bindable.Object({name:"john"}));
      expect(tpl.bindings.clippedBuffer.buffer[0].clip.get("_id")).to.be("aa");
      expect(tpl.bindings.clippedBuffer.buffer[0].clip.get("_id2")).to.be("aaa");
      expect(tpl.bindings.clippedBuffer.buffer[0].clip.get("value")).to.be("john");
    });

  });
});
