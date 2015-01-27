var expect = require("expect.js"),
template   = require("../../lib/template"),
parser  = require("../../lib/parser"),
BindableObject = require("bindable-object");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can create a new template with a string source", function () {
    var tpl = template("hello world");
    expect(typeof tpl.vnode).to.be("object");
  });

  it("can create a new template with a script as the source", function () {
    var script,
    tpl = template(script = parser.compile("hello world"));
    expect(typeof tpl.vnode).to.be("object");
  });

  it("throws an error if the source is anything other than a string, or function", function () {
    
    var err;
    try {
      template({});
    } catch (e) {
      err = e;
    }

    expect(err).not.to.be(void 0);
  });

  it("template is not cached if the source is a string, and has been re-used", function () {
    var source,
    tpl = template(source = "hello world");
    expect(tpl).not.to.be(template(source));
  });

  it("template is not cached if the source is a function, and has been re-used", function () {
    var script,
    tpl = template(script = parser.compile("hello world"));
    expect(tpl).not.to.be(template(script));
  });

  it("can rener text elements", function () {
    var v = template("hello world").view();
    expect(v.render().toString()).to.be("hello world");
  });

  it("can render tag elements", function () {
    var v = template("<span>hello world</span>").view();
    expect(v.render().toString()).to.be("<span>hello world</span>");
  });

  it("can render comment elements", function () {
    var v = template("<!--comment-->").view()
    expect(v.render().toString()).to.be("<!--comment-->");
  });

  it("can parse block elements", function () {
    var v = template("{{name}}").view({name:"a"});
    expect(v.render().toString()).to.be("a");
  });

  it("can pass a bindable object as the context of a view", function () {
    var v = template("{{name}}").view(new BindableObject({name: "a" }));
    expect(v.render().toString()).to.be("a");
  });

  it("syncs changes from the view context back to a vanilla object", function () {
    var ctx;
    var v = template("{{name}}").view(ctx = {name:"a"});
    v.context.set("name", "b");
    expect(v.render().toString()).to.be("b");
    expect(ctx.name).to.be("b");
  });

  it("can change the context of a view", function () {
    var v = template("{{name}}").view({name:"a"});
    expect(v.render().toString()).to.be("a");
    v.bind({name:"b"})
    expect(v.render().toString()).to.be("b");
  });

  it("doesn't sync changes from previous context", function () {

    var ac = new BindableObject({name:"a"}),
    bc     = new BindableObject({name:"b"});

    var v = template("{{name}}").view(ac);
    expect(v.render().toString()).to.be("a");
    v.bind(bc)
    expect(v.render().toString()).to.be("b");
    ac.set("name", "c");
    expect(v.render().toString()).to.be("b");
  });


});