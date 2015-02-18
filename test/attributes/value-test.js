var expect     = require("expect.js"),
pc             = require("../.."),
template       = pc.template,
nodeFactory = require("nofactor/lib/dom"),
defaultNodeFactory = require("nofactor"),
sinon     = require("sinon");


/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  before(function () {
    pc.nodeFactory = nodeFactory;
  });


  after(function () {
    pc.nodeFactory = defaultNodeFactory;
  });


  it("can data-bind to a reference", function (next) {
    var t = pc.template("<input type='text' value={{ <~>name }} />", pc);

    var b = t.view({name:"abba"});
    var input = b.render();
    input.value = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(b.get("name")).to.be("baab");
      b.dispose();
      next();
    }, 10);
  });

  it("can data-bind to an element if contentEditable is true", function (next) {
    var t = pc.template("<span value={{ <~>name }} contentEditable='true' />", pc);

    var b = t.view();
    var input = b.render();
    input.innerHTML = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(b.get("name")).to.be("baab");
      b.dispose();
      next();
    }, 10);
  });

  it("can data-bind to a checkbox", function (next) {
    var t = pc.template("<input type='checkbox' checked={{ <~>checked }} />", pc);

    var b = t.view({name:"abba"});
    var input = b.render();
    input.checked = true;
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(b.get("checked")).to.be(true);
      b.set("checked", false);
      expect(input.checked).to.be(false);
      b.dispose();
      next();
    }, 10);
  });

  it("propagates event if keycode is 27", function (next) {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc);

    var b = t.view();
    var input = b.render();
    input.value = "abba";
    var e = document.createEvent("Event");
    e.initEvent("keyup", true, true);
    e.keyCode = 27;
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(b.get("value")).to.be("abba");
      b.dispose();
      next();
    }, 10);
  });

  it("stops propagating event if keycode isn't 27", function (next) {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc);

    var b = t.view();
    var input = b.render();
    input.value = "abba";
    var e = document.createEvent("Event");
    e.initEvent("keyup", true, true);
    e.keyCode = 30;
    var stub = sinon.stub(e, "stopPropagation");
    input.dispatchEvent(e);


    setTimeout(function () {
      expect(stub.callCount).to.be(1);
      b.dispose();
      next();
    }, 10);
  });

  it("can data-bind to a ref path", function (next) {
    var t = pc.template("<input type='text' value={{ <~>a.b.c.d.e }} />", pc);

    var b = t.view({});
    var input = b.render();
    input.value = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(b.get("a.b.c.d.e")).to.be("baab");
      b.dispose();
      next();
    }, 10);
  });

  it("can accept only changes", function (next) {
    var t = pc.template("<input type='text' value={{ <~name }} />", pc);

    var b = t.view({name:"abba"});
    var input = b.render();
    input.value = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(b.get("name")).to.be("abba");
      b.set("name", "bbaa");
      setTimeout(function () {
        expect(input.value).to.be("bbaa");
        b.dispose();
        next();
      }, 10);
    }, 10);
  });

  it("can send only changes", function (next) {
    var t = pc.template("<input type='text' value={{ ~>name }} />", pc);

    var b = t.view({name:"abba"});
    var input = b.render();
    input.value = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      expect(b.get("name")).to.be("baab");
      b.set("name", "bbaa");
      setTimeout(function () {
        expect(b.get("name")).to.be("bbaa");
        b.dispose();
        next();
      }, 10);
    }, 10);
  });

  // test autocomplete
  "text password email".split(" ").forEach(function (type) {
    it("data-binds the input field to the context with no event trigger for " + type + " types", function (next) {
      var t = pc.template("<input type='"+type+"' value={{ <~>name }} />", pc),
      c = {}

      var b = t.view(c);
      var input = b.render();
      input.value = "baab";

      setTimeout(function () {
        expect(c.name).to.be("baab");
        b.dispose();
        next();
      }, process.browser ? 600 : 10);
    });
  });

  it("shows an error if the value is not a reference", function () {
    var err;
    try {
      var t = pc.template("<input type='text' value={{ name }} />", pc),
      v     = t.view({name:"a"});
    } catch (e) {
      err = e;
    }

    expect(err.message).to.contain("must be a reference");
  });

  it("can handle 0s", function () {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc),
      v     = t.view({value:0});

    expect(v.section.node.value).to.be("0");
  });

  it("can handle false", function () {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc),
      v     = t.view({value:false});

    expect(v.section.node.value).to.be("false");
  });

  it("properly re-binds to another reference value if it changes", function () {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc),
      v     = t.view({value:"a"});

    v.render();
    v.runloop.runNow();

    expect(v.section.node.value).to.be("a");

    v.set("value", "b");
    v.runloop.runNow();
    expect(v.section.node.value).to.be("b");
  });

  it("doesn't bust if value is initially undefined and there's an input", function () {
    var t = pc.template("<input type='text' value={{ value }} />", pc),
      v     = t.view();


    var input = v.render();
    input.value = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

  });
});