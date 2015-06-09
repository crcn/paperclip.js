var expect             = require("expect.js");
var compiler           = require("./compiler");
var ivd                = require("ivd");
var template           = require("./template");
var doc                = require("nofactor");
var createBindingClass = require("./createBindingClass");

describe(__filename + "#", function() {

  function vnode(factory) {
    return factory(ivd.fragment, ivd.element, ivd.text, ivd.comment, ivd.dynamic, createBindingClass);
  }

  describe("text nodes", function() {
    it("can compile a text element", function() {
      var el = vnode(compiler.compile("hello"));
      expect(el.freeze({ document: doc }).toString()).to.be("hello");
    });
  });

  describe("elements", function() {
    it("can be compiled", function() {
      var el = vnode(compiler.compile("<div />"));
      expect(el.freeze({ document: doc }).toString()).to.be("<div></div>");
    });

    it("can be compiled with multiple children", function() {
      var el = vnode(compiler.compile("<div /><div />"));
      expect(el.freeze({ document: doc }).toString()).to.be("<div></div><div></div>");
    });

    it("can be compiled with attributes", function() {
      var el = vnode(compiler.compile("<div a='1' />"));
      expect(el.freeze({ document: doc }).toString()).to.be("<div a=\"1\"></div>");
    });

    it("can be compiled with a script attribute", function() {
      var tpl = template("<div a=\"{{b}}\" />");
      var v   = tpl.view({b:"c"});
      expect(v.toString()).to.be("<div a=\"c\"></div>");
    });

    it("can be compiled with a script attribute and a string", function() {
      var tpl = template("<div a=\"{{b}} c2\" />");
      var v   = tpl.view({b:"c"});
      expect(v.toString()).to.be("<div a=\"c c2\"></div>");
    });

    it("can be compiled with multiple scripts in attrs", function() {
      var tpl = template("<div a=\"{{b}} c {{d}}\" />");
      var v   = tpl.view({b:"c"});
      expect(v.toString()).to.be("<div a=\"c c undefined\"></div>");
    });

    it("can set multiple attributes", function() {
      var tpl = template("<div a=\"{{b}} c {{d}}\" c=\"d\" />");
      var v   = tpl.view({b:"c"});
      expect(v.toString()).to.be("<div c=\"d\" a=\"c c undefined\"></div>");
    });

    it("can be parsed with multiple children", function() {
      var el = vnode(compiler.compile("<div>a <span /><!--comment--></div>"));
      expect(el.freeze({ document: doc }).toString()).to.be("<div>a <span></span><!--comment--></div>");
    });

    it("sets the property of an element if quotes are omitted", function() {
      var tpl = template("<input value={{b}} />");
      var v   = tpl.view({b:"c"});
      var node = v.render();
      expect(node.value).to.be("c");
      v.update({b:"d"});
      expect(node.value).to.be("d");
    });
  });

  describe("blocks", function() {
    it("can be rendered", function() {
      var tpl = template("{{a}}");
      var v   = tpl.view({a:"b"});
      expect(v.toString()).to.be("b");
    });

    [

      ["a||b"                   , [{a:1, b:2}, "1"], [{a:false, b:2}, "2"]],
      ["a===b"                  , [{a:1, b:1}, "true"], [{a:1, b:"1"}, "false"]],
      ["a==b"                   , [{a:1, b:1}, "true"], [{a:1, b:"1"}, "true"], [{a:1, b:2}, "false"]],
      ["a?b:c"                  , [{a:1, b:2}, "2"], [{a:false, b:2, c:3}, "3"]],
      ["a-b"                    , [{a:1, b:2}, "-1"]],
      ["a.b.c"                  , [{a:{b:{c:1}}}, "1"]],
      ["null"                   , [{}, "null"]],
      ["!a"                     , [{a:false}, "true"]],
      ["!!a"                    , [{a:1}, "true"]],
      ["-a"                     , [{a:1}, "-1"]],
      ["add(a, b)"              , [{add: function(a, b) { return a + b; }, a:1, b: 2}, "3"]],
      ["a|abs"                  , [{a:-1}, "1"]],
      ["a|abs|add(5)"           , [{a:-1}, "6"]],
      ["a.b.c(1,2)"             , [{a:{b:{c:function(a, b) { return a + b; }}}}, "3"]],
      ["a + '-' + b + '-' + c"  , [{a:1, b:2, c:3}, "1-2-3"]],
      ["a+-b"                   , [{a:5, b:-2}, "7"]],
      ["a-(-b)"                 , [{a:5, b:-2}, "3"]],
      ["10>=10===true"          , [{}, "true"]]

    ].forEach(function(test) {
      it("can parse " + test[0], function() {
        var tpl = template("{{" + test[0] + "}}", {
          modifiers: {
            abs: Math.abs,
            add: function(a, b) { return a + b; }
          }
        });
        test.slice(1).forEach(function(match) {
          var v   = tpl.view(match[0]);
          v.update(match[0]);
          expect(v.toString()).to.be(match[1]);
        });
      });
    });
  });

  describe("binding operators", function() {

  });

  describe("components", function() {

    it("can be rendered", function() {

      var tpl = template("<message />", {
        components: {
          message: function(section) {
            section.appendChild(section.document.createTextNode("Hello"));
          }
        }
      });

      var v = tpl.view();
      expect(v.toString()).to.be("Hello");
    });

    it("can dynamically update attributes", function() {

      function Message(section) {
        section.appendChild(this.node = section.document.createTextNode(""));
        this.attributes = {};
      }

      Message.prototype.setAttribute = function(k, v) {
        this.attributes[k] = v;
      };

      Message.prototype.update = function() {
        this.node.nodeValue = this.attributes.text;
      };

      var tpl = template("<message text=\"{{message}}\" />", {
        components: {
          message: Message
        },
        document: doc
      });

      var v = tpl.view({ message: "a" });
      expect(v.toString()).to.be("a");
      v.update({ message: "b" });
      expect(v.toString()).to.be("b");
    });
  });

  describe("can add a ", function(next) {

    [
      "onClick",
      "onDoubleClick",
      "onFocus",
      "onFocusIn",
      "onFocusOut",
      "onLoad",
      "onSubmit",
      "onMouseDown",
      "onMouseOver",
      "onMouseOut",
      "onMouseUp",
      "onMouseMove",
      "onKeyDown",
      "onKeyUp",
      "onChange"
    ].forEach(function(name) {
      it(name + " event", function(next) {

        var event = name.replace(/^on/, "").toLowerCase();
        var tpl = template("<div " + name + "={{handleEvent(event)}} />");

        var v = tpl.view({ handleEvent: function(e) {
          expect(e._type).to.be(event);
          next();
        }});
        var div = v.render();
        var e = document.createEvent(event);
        e.initEvent(event, true, true);

        div.dispatchEvent(e);
      });
    });
  });
});
