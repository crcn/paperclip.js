var assert     = require("assert"),
pc             = require("../../"),
template       = pc.template,
sinon     = require("sinon");


/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {




  it("can data-bind to a reference", function (next) {
    var t = pc.template("<input type='text' value={{ <~>name }} />");

    var b = t.view({name:"abba"});
    var input = b.render();
    input.value = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      assert.equal(b.get("name"), "baab");
      next();
    }, 10);
  });

  it("can data-bind to an element if contentEditable is true", function (next) {
    var t = pc.template("<span value={{ <~>name }} contentEditable='true' />", pc);

    var b = t.view({});
    var input = b.render();
    input.innerHTML = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);

    setTimeout(function () {
      assert.equal(b.get("name"), "baab");
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
      assert.equal(b.get("checked"), true);
      b.set("checked", false);
      assert.equal(input.checked, false);
      next();
    }, 10);
  });

  it("propagates event if keycode is 27", function (next) {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc);

    var b = t.view({});
    var input = b.render();
    input.value = "abba";
    var e = document.createEvent("Event");
    e.initEvent("keyup", true, true);
    e.keyCode = 27;
    input.dispatchEvent(e);

    setTimeout(function () {
      assert.equal(b.get("value"), "abba");
      next();
    }, 10);
  });

  it("stops propagating event if keycode isn't 27", function (next) {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc);

    var b = t.view({});
    var input = b.render();
    input.value = "abba";
    var e = document.createEvent("Event");
    e.initEvent("keyup", true, true);
    e.keyCode = 30;
    var stub = sinon.stub(e, "stopPropagation");
    input.dispatchEvent(e);


    setTimeout(function () {
      assert.equal(stub.callCount, 1);
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
      assert.equal(b.get("a.b.c.d.e"), "baab");
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
      assert.equal(b.get("name"), "abba");
      b.set("name", "bbaa");
      setTimeout(function () {
        assert.equal(input.value, "bbaa");
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
      assert.equal(b.get("name"), "baab");
      b.set("name", "bbaa");
      setTimeout(function () {
        assert.equal(b.get("name"), "bbaa");
        assert.equal(input.value, "baab");
        next();
      }, 10);
    }, 10);
  });

  it("doesn't set value if only binding from value ~> model", function (next) {
    var t = pc.template("<input type='text' value={{ ~>name }} />", pc);

    var b = t.view({name:"abba"});
    var input = b.render();

    setTimeout(function () {
      assert.equal(input.value, '');
      next();
    }, 10);
  });

  it("sets value if binding is <~", function (next) {
    var t = pc.template("<input type='text' value={{ <~name }} />", pc);

    var b = t.view({name:"abba"});
    var input = b.render();

    setTimeout(function () {
      assert.equal(input.value, "abba");
      next();
    }, 10);
  });

  it("sets value if binding is <~>", function (next) {
    var t = pc.template("<input type='text' value={{ <~>name }} />", pc);

    var b = t.view({name:"abba"});
    var input = b.render();

    setTimeout(function () {
      assert.equal(input.value, "abba");
      next();
    }, 10);
  });

  // test autocomplete
  "text password email".split(" ").forEach(function (type) {
    xit("data-binds the input field to the context with no event trigger for " + type + " types", function (next) {
      var t = pc.template("<input type='"+type+"' value={{ <~>name }} />", pc),
      c = {}

      var b = t.view(c);
      var input = b.render();
      input.value = "baab";

      setTimeout(function () {
        assert.equal(c.name, "baab");
        next();
      }, process.browser ? 600 : 10);
    });
  });

  it("shows an error if the value is not a reference", function () {
    var err;
    try {
      var t = pc.template("<input type='text' value={{ name }} />", pc),
      v     = t.view({name:"a"});
      v.render();
    } catch (e) {
      err = e;
    }

    assert.notEqual(err.message.indexOf("must be a reference"), -1);
  });

  it("can handle 0s", function () {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc),
      v     = t.view({value:0});

      v.render();
    assert.equal(v.section.node.value, "0");
  });

  it("can handle false", function () {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc),
      v     = t.view({value:false});
      v.render();

    assert.equal(v.section.node.value, "false");
  });

  it("properly re-binds to another reference value if it changes", function () {
    var t = pc.template("<input type='text' value={{ <~>value }} />", pc),
      v     = t.view({value:"a"});

    v.render();

    assert.equal(v.section.node.value, "a");

    v.set("value", "b");
    assert.equal(v.section.node.value, "b");
  });

  it("doesn't bust if value is initially undefined and there's an input", function () {
    var t = pc.template("<input type='text' value={{ value }} />", pc),
      v     = t.view({});

    var input = v.render();
    input.value = "baab";
    var e = document.createEvent("Event");
    e.initEvent("change", true, true);
    input.dispatchEvent(e);
  });

  it("can specify a value for the input without blocks", function() {
    var t = pc.template("<input type='text' value='blarg' />", pc),
      v     = t.view({});

    var input = v.render();
    assert.equal(stringifyView(v), '<input value="blarg" type="text">');
  });
});
