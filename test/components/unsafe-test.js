var expect     = require("expect.js"),
pc             = require("../../lib")
template       = pc.template,
BindableObject = require("bindable-object");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {


  it("can embed unsafe html", function () {
    var v = pc.template(
      "<unsafe value={{html}} />"
    , pc).view({
      html: "<h1>a b</h1>"
    });

    expect(v.toString()).to.be("<h1>a b</h1>");
  });

  it("can render an html string", function () {
    var frag = pc.template("hello <unsafe value={{content}} />", pc).view({ content: "abc" }).render();
    expect(frag.toString()).to.be("hello abc");
  });

  it("can accept an undefined value", function () {
    var t = pc.template("hello <unsafe value={{undefined}} />", pc).view().render();
    expect(t.toString()).to.be("hello ");
  });


  it("can render a child fragment", function () {
    var c = new BindableObject({
      name: "bob"
    });

    var t = pc.template("hello <unsafe value={{content}} />", pc).view(c),
    t2    = pc.template("world", pc),
    t3    = pc.template("{{name}}", pc);

    var b2, b3;

    c.set("content", b2 = t2.view({}));


    expect(t.toString()).to.be("hello world");
    c.set("content", b3 = t3.view(c));
    expect(t.toString()).to.be("hello bob");
    c.set("content", b2);
    expect(t.toString()).to.be("hello world");
    c.set("content", b3);
    expect(t.toString()).to.be("hello bob");
  });


  it("can render a sub-child fragment", function () {

    var c = new BindableObject(),
    c2    = new BindableObject(),
    c3    = new BindableObject();

    var t = pc.template("hello <unsafe value={{content}} />", pc).view(c),
    t2    = pc.template("my name is <unsafe value={{content}} />",  pc).view(c2),
    t3    = pc.template("{{name}}", pc).view(c3);

    expect(t.toString()).to.be("hello ");
    c.set("content", t2);
    expect(t.toString()).to.be("hello my name is ");
    c2.set("content", t3);
    c3.set("name", "bob");
    expect(t.toString()).to.be("hello my name is bob");
    c.set("content", t3);
    expect(t.toString()).to.be("hello bob");
  });


  it("can be used within a conditional statement", function () {

    var c = new BindableObject({
      condition: true,
      content: pc.template("{{name}}").view({ name: "bob" })
    })

    var t = pc.template(
      "hello <show when={{condition}}>" + 
        "<unsafe value={{content}} />" +
      "</show>!"
    , pc).view(c);

    expect(t.toString()).to.be("hello bob!")
    c.set("condition", false);
    expect(t.toString()).to.be("hello !");
  });

});

