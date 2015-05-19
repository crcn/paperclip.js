var expect   = require("expect.js");
var compiler = require("./compiler");
var ivd      = require("ivd");
var document = require("nofactor");

describe(__filename + "#", function() {

  function vnode(factory) {
    return factory(ivd.fragment, ivd.element, ivd.text, ivd.comment, ivd.dynamic);
  }

  describe("text nodes", function() {
    it("can compile a text element", function() {
      var el = vnode(compiler.compile("hello"));
      expect(el.create(document).toString()).to.be("hello");
    });
  });

  describe("elements", function() {
    it("can be compiled", function() {
      var el = vnode(compiler.compile("<div />"));
      expect(el.create(document).toString()).to.be("<div></div>");
    });

    it("can be compiled with multiple children", function() {
      var el = vnode(compiler.compile("<div /><div />"));
      expect(el.create(document).toString()).to.be("<div></div><div></div>");
    });

    it("can be compiled with attributes", function() {
      var el = vnode(compiler.compile("<div a='1' />"));
      expect(el.create(document).toString()).to.be("<div a=\"1\"></div>");
    });

    it("can be compiled with a script attribute", function() {
      var tpl = ivd.template(vnode(compiler.compile("<div a={{b}} />")));
      var v   = tpl.view({b:"c"});
      expect(v.render().toString()).to.be("<div a=\"c\"></div>");
    });

    it("can be compiled with a script attribute and a string", function() {
      var tpl = ivd.template(vnode(compiler.compile("<div a=\"{{b}} c2\" />")));
      var v   = tpl.view({b:"c"});
      expect(v.render().toString()).to.be("<div a=\"c c2\"></div>");
    });

    it("can be compiled with multiple scripts in attrs", function() {
      var tpl = ivd.template(vnode(compiler.compile("<div a=\"{{b}} c {{d}}\" />")));
      var v   = tpl.view({b:"c"});
      expect(v.render().toString()).to.be("<div a=\"c c undefined\"></div>");
    });

    it("can be parsed with multiple children", function() {
      var el = vnode(compiler.compile("<div>a <span /><!--comment--></div>"));
      expect(el.create(document).toString()).to.be("<div>a <span></span><!--comment--></div>");
    });
  });
});
