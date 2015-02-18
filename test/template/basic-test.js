var expect = require("expect.js"),
pc         = require("../.."),
template   = pc.template,
parser  = require("../../lib/parser"),
stringifyView = require("../utils/stringifyView"),
assert = require("assert");

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

  it("can use a template with useCloneNode = false", function () {
    var tpl = template(script = parser.compile("hello world"), { useCloneNode: false });
    expect(stringifyView(tpl.view())).to.be("hello world");
    expect(stringifyView(tpl.view())).to.be("hello world");
  });

  it("throws an error if the source is a string and there is no parser", function () {
    var p = template.parser;
    template.parser = void 0;
    assert.throws(function () {
      template("blah");
    }, Error);
    template.parser = p;
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
    expect(stringifyView(v)).to.be("hello world");
  });

  it("can render tag elements", function () {
    var v = template("<span>hello world</span>").view();
    expect(stringifyView(v)).to.be("<span>hello world</span>");
  });

  it("can render comment elements", function () {
    var v = template("<!--comment-->").view()
    expect(stringifyView(v)).to.be("<!--comment-->");
  });

  it("can parse block elements", function () {
    var v = template("{{name}}").view({name:"a"});
    expect(stringifyView(v)).to.be("a");
  });

  if (!process.browser)
  it("converts HTML entities to real characters", function() {
    var tpl = pc.template("hello &gt;");
    expect(tpl.view().toString()).to.be("hello >")
  });

  if (!process.browser)
  it("doesn't do overzealous HTML entity decoding", function() {
    var tpl = pc.template("foo &amp;amp; bar");
    expect(tpl.view().toString()).to.be("foo &amp; bar")
  });

  if (!process.browser)
  it("has all the right defaults", function () {
    var tpl = pc.template("foo &amp;amp; bar", {});
    expect(tpl.components.show).not.to.be(void 0);
    expect(tpl.attributes.onclick).not.to.be(void 0);
    expect(tpl.modifiers.uppercase).not.to.be(void 0);
    expect(tpl.accessorClass).not.to.be(void 0);
  });
  
});