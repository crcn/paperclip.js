var expect = require("expect.js"),
template   = require("../../lib/template"),
parser  = require("../../lib/parser");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can create a new template with a string source", function () {
    var tpl = template("hello world");
    expect(tpl.script).not.to.be(void 0);
    expect(typeof tpl.script).to.be("function");
  });

  it("can create a new template with a script as the source", function () {
    var script,
    tpl = template(script = parser.compile("hello world"));
    expect(tpl.script).to.be(script);
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

  it("template is cached if the source is a string, and has been re-used", function () {
    var source,
    tpl = template(source = "hello world");
    expect(tpl).to.be(template(source));
  });

  it("template is cached if the source is a function, and has been re-used", function () {
    var script,
    tpl = template(script = parser.compile("hello world"));
    expect(tpl).to.be(template(script));
  });

  it("can parse text elements", function () {
    var tpl = template("hello world").view();
    expect(tpl.render().toString()).to.be("hello world");
  });

  it("can parse tag elements", function () {
    var tpl = template("<span>hello world</span>").view();
    expect(tpl.render().toString()).to.be("<span>hello world</span>");
  })
});