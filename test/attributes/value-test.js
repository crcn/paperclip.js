var expect     = require("expect.js"),
paperclip      = require("../../lib"),
template       = paperclip.template;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {


  it("doesn't add an attribute binding if the attr is a string", function () {
    var tpl = template("<input value='test'></input>"), v = tpl.view();
    expect(v.render().toString()).to.be('<input value="test">');
  });

  it("binds the input to the value if the value is a script", function () {
    var tpl = template("<input value={{<~>value}}></input>", paperclip), v = tpl.view({});
    expect(v.render().toString()).to.be('<input>');
  });
});