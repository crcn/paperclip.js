var assert = require("assert"),
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
    assert.equal(typeof tpl.vnode, "object");
  });

  it("can create a new template with a script as the source", function () {
    var script,
    tpl = template(script = parser.compile("hello world"));
    assert.equal(typeof tpl.vnode, "object");
  });

  it("can use a template with useCloneNode = false", function () {
    var tpl = template(script = parser.compile("hello world"), { useCloneNode: false });
    assert.equal(stringifyView(tpl.view()), "hello world");
    assert.equal(stringifyView(tpl.view()), "hello world");
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

    assert.notEqual(err, void 0);
  });

  it("template is not cached if the source is a string, and has been re-used", function () {
    var source,
    tpl = template(source = "hello world");
    assert.notEqual(tpl, template(source));
  });

  it("template is not cached if the source is a function, and has been re-used", function () {
    var script,
    tpl = template(script = parser.compile("hello world"));
    assert.notEqual(tpl, template(script));
  });

  it("can rener text elements", function () {
    var v = template("hello world").view();
    assert.equal(stringifyView(v), "hello world");
  });

  it("can render tag elements", function () {
    var v = template("<span>hello world</span>").view();
    assert.equal(stringifyView(v), "<span>hello world</span>");
  });

  it("can render comment elements", function () {
    var v = template("<!--comment-->").view()
    assert.equal(stringifyView(v), "<!--comment-->");
  });

  it("can parse block elements", function () {
    var v = template("{{name}}").view({name:"a"});
    assert.equal(stringifyView(v), "a");
  });

  if (!process.browser)
  it("converts HTML entities to real characters", function() {
    var tpl = pc.template("hello &gt;");
    assert.equal(tpl.view().toString(), "hello >")
  });

  if (!process.browser)
  it("doesn't do overzealous HTML entity decoding", function() {
    var tpl = pc.template("foo &amp;amp; bar");
    assert.equal(tpl.view().toString(), "foo &amp; bar")
  });

  if (!process.browser)
  it("has all the right defaults", function () {
    var tpl = pc.template("foo &amp;amp; bar", {});
    assert.notEqual(tpl.components.show, void 0);
    assert.notEqual(tpl.attributes.onclick, void 0);
    assert.notEqual(tpl.modifiers.uppercase, void 0);
    assert.notEqual(tpl.accessorClass, void 0);
  });
  
});