var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object"),
nofactor = require("nofactor"),
Application = require("mojo-application")

describe(__filename + "#", function () {

  var app = new Application({ nodeFactory: nofactor.dom });
  app.use(pc);

  describe("input text", function () {
    it("can data-bind to a reference", function (next) {
      var t = pc.template("<input type='text' model={{ <~>name }} />", app),
      c = new BindableObject({name:"abba"});
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();
      var input = r.childNodes[1];
      input.value = "baab";
      var e = document.createEvent("Event");
      e.initEvent("change");
      input.dispatchEvent(e);

      setTimeout(function () {
        expect(c.get("name")).to.be("baab");
        b.dispose();
        next();
      }, 10);
    });

    it("can data-bind to a ref path", function (next) {
      var t = pc.template("<input type='text' model={{ <~>a.b.c.d.e }} />", app),
      c = new BindableObject();
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var input = r.childNodes[1];
      input.value = "baab";
      var e = document.createEvent("Event");
      e.initEvent("change");
      input.dispatchEvent(e);

      setTimeout(function () {
        expect(c.get("a.b.c.d.e")).to.be("baab");
        b.dispose();
        next();
      }, 10);
    });

    it("can accept only changes", function (next) {
      var t = pc.template("<input type='text' model={{ <~name }} />", app),
      c = new BindableObject({name:"abba"});
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var input = r.childNodes[1];
      input.value = "baab";
      var e = document.createEvent("Event");
      e.initEvent("change");
      input.dispatchEvent(e);

      setTimeout(function () {
        expect(c.get("name")).to.be("abba");
        c.set("name", "bbaa");
        setTimeout(function () {
          expect(input.value).to.be("bbaa");
          b.dispose();
          next();
        }, 10);
      }, 10);
    });

    it("can send only changes", function (next) {
      var t = pc.template("<input type='text' model={{ ~>name }} />", app),
      c = new BindableObject({name:"abba"});
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var input = r.childNodes[1];
      input.value = "baab";
      var e = document.createEvent("Event");
      e.initEvent("change");
      input.dispatchEvent(e);

      setTimeout(function () {
        expect(c.get("name")).to.be("baab");
        c.set("name", "bbaa");
        setTimeout(function () {
          expect(c.get("name")).to.be("bbaa");
          b.dispose();
          next();
        }, 10);
      }, 10);
    });

    // test autocomplete
    "text password email".split(" ").forEach(function (type) {
      it("data-binds the input field to the context with no event trigger for " + type + " types", function (next) {
        var t = pc.template("<input type='"+type+"' model={{ <~>name }} />", app),
        c = new BindableObject();
        c.set("this", c);

        var b = t.bind(c);
        var r = b.render();

        var input = r.childNodes[1];
        input.value = "baab";

        setTimeout(function () {
          expect(c.get("name")).to.be("baab");
          b.dispose();
          next();
        }, 10);
      });
    });
  });

});