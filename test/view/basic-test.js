var expect     = require("expect.js"),
template       = require("../../lib/template"),
parser         = require("../../lib/parser"),
BindableObject = require("bindable-object"),
Component      = require("../../lib").Component;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can render a view", function () {
    var tpl = template("hello world");
    expect(tpl.view().render().toString()).to.be("hello world");
  });
});