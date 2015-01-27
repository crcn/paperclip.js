var expect     = require("expect.js"),
template       = require("../../lib/template"),
parser         = require("../../lib/parser"),
BindableObject = require("bindable-object"),
Component      = require("../../lib").Component;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {


  it("doesn't add an attribute binding if the attr is a string", function () {
    var tpl = template("<input value='test'></input>"), v = tpl.view();
    expect(v.render().toString()).to.be('<input value="test">');
  });
});