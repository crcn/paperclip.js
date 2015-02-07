var expect     = require("expect.js"),
pc             = require("../..")
template       = pc.template,
stringifyView  = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("doesn't inherit properties if parent isn't set", function () {

    var t = pc.template("hello {{name}}"),
    v     = t.view({name:"a"}),
    v2    = t.view(void 0);

    expect(stringifyView(v2)).to.be("hello ");
  });

  it("properly inherits a property from the parent view", function () {

    var t = pc.template("hello {{name}}"),
    v     = t.view({name:"a"}),
    v2    = t.view(void 0, { parent: v });

    expect(stringifyView(v2)).to.be("hello a");
  });

  it("properly inherits functions & calls them", function () {
    var t = pc.template("hello {{getName()}}"),
    v     = t.view({
      getName: function () {
        return "a"
      }
    }),
    v2    = t.view(void 0, { parent: v });

    expect(stringifyView(v2)).to.be("hello a");
  });

});