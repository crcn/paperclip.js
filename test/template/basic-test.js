var assert = require("assert"),
pc         = require("../.."),
template   = pc.template,
parser  = require("../../lib/parser"),
compiler = require("../../lib/compiler"),
stringifyView = require("../utils/stringifyView"),
assert = require("assert");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can create a new template with a string source", function () {
    var tpl = pc.template("hello world");
    assert.equal(typeof tpl.vnode, "object");
  });

  it("can create a new template with a script as the source", function () {
    var script,
    tpl = template(script = compiler.compile("hello world"));
    assert.equal(typeof tpl.vnode, "object");
  });

  xit("can use a template with useCloneNode = false", function () {
    var tpl = template(script = parser.compile("hello world"), { useCloneNode: false });
    assert.equal(stringifyView(tpl.view()), "hello world");
    assert.equal(stringifyView(tpl.view()), "hello world");
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
    tpl = template(script = compiler.compile("hello world"));
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


  it("can parse templates with empty attributes", function() {
    var tpl = pc.template("<div id='test' empty-attribute='' ></div>");
    var v = tpl.view();
    v.render();
  })

});
