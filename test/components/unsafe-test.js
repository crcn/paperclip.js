var expect     = require("expect.js"),
pc             = require("../..")
template       = pc.template,
stringifyView = require("../utils/stringifyView")

/*

var tpl = paperclip.template("abba")
*/


describe(__filename + "#", function () {


  it("can embed unsafe html", function () {
    var v = pc.template(
      "<unsafe html={{html}} />"
    , pc).view({
      html: "<h1>a b</h1>"
    });

    expect(stringifyView(v)).to.be("<h1>a b</h1>");
  });

  it("can render an html string", function () {
    var v = pc.template("hello <unsafe html={{content}} />", pc).view({ content: "abc" });
    expect(stringifyView(v)).to.be("hello abc");
  });

  it("can accept an undefined value", function () {
    var v = pc.template("hello <unsafe html={{undefined}} />", pc).view();
    expect(stringifyView(v)).to.be("hello ");
  });


  it("can render a child fragment", function () {
    var c = {
      name: "bob"
    }

    var t = pc.template("hello <unsafe html={{content}} />", pc).view(c),
    t2    = pc.template("world", pc),
    t3    = pc.template("{{name}}", pc);

    var b2, b3;

    c.content = b2 = t2.view({});

    t.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello world");
    c.content = b3 = t3.view(c);
    t.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello bob");
    c.content = b2;
    t.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello world");
    c.content = b3;
    t.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello bob");
  });


  it("can render a sub-child fragment", function () {

    var c = {},
    c2    = {},
    c3    = {};

    var t = pc.template("hello <unsafe html={{content}} />", pc).view(c),
    t2    = pc.template("my name is <unsafe html={{content}} />",  pc).view(c2),
    t3    = pc.template("{{name}}", pc).view(c3);

    expect(t.toString()).to.be("hello ");
    c.content = t2;

    t.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello my name is ");
    c2.content = t3;
    c3.name = "bob";
    t.accessor.apply();
    t3.accessor.apply();
    t2.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello my name is bob");
    c.content = t3;

    t2.unbind();
    t.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello bob");
  });


  it("can be used within a conditional statement", function () {

    var c = {
      condition: true,
      content: pc.template("{{name}}").view({ name: "bob" })
    };

    var t = pc.template(
      "hello <show when={{condition}}>" + 
        "<unsafe html={{content}} />" +
      "</show>!"
    , pc).view(c);

    expect(t.toString()).to.be("hello bob!")
    c.condition = false;
    t.accessor.apply();
    t.runloop.runNow();
    expect(t.toString()).to.be("hello !");
  });

});

