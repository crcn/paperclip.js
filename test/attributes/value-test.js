var expect     = require("expect.js"),
pc             = require("../../lib"),
template       = pc.template,
nofactor       = require("nofactor"),
BindableObject = require("bindable-object");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  before(function () {
    pc.nodeFactory = nofactor.dom;
  });


  after(function () {
    pc.nodeFactory = nofactor.default;
  });


  it("can data-bind to a reference", function (next) {
    var t = pc.template("<input type='text' value={{ <~>name }} />", pc),
    c = new BindableObject({name:"abba"});
    c.set("this", c);

    var b = t.view(c);
    var input = b.render();
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

  it("can data-bind to a checkbox", function (next) {
    var t = pc.template("<input type='checkbox' checked={{ <~>checked }} />", pc),
    c = new BindableObject({name:"abba"});
    c.set("this", c);

    var b = t.view(c);
    var input = b.render();
    input.checked = true;
    var e = document.createEvent("Event");
    e.initEvent("change");
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(c.get("checked")).to.be(true);
      c.set("checked", false);
      expect(input.checked).to.be(false);
      b.dispose();
      next();
    }, 10);
  });

  it("can data-bind to a ref path", function (next) {
    var t = pc.template("<input type='text' value={{ <~>a.b.c.d.e }} />", pc),
    c = new BindableObject();
    c.set("this", c);

    var b = t.view(c);
    var input = b.render();
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
    var t = pc.template("<input type='text' value={{ <~name }} />", pc),
    c = new BindableObject({name:"abba"});
    c.set("this", c);

    var b = t.view(c);
    var input = b.render();
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
    var t = pc.template("<input type='text' value={{ ~>name }} />", pc),
    c = new BindableObject({name:"abba"});
    c.set("this", c);

    var b = t.view(c);
    var input = b.render();
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
      var t = pc.template("<input type='"+type+"' value={{ <~>name }} />", pc),
      c = new BindableObject();
      c.set("this", c);

      var b = t.view(c);
      var input = b.render();
      input.value = "baab";

      setTimeout(function () {
        expect(c.get("name")).to.be("baab");
        b.dispose();
        next();
      }, 10);
    });
  });
});