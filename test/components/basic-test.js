var expect = require("expect.js"),
template   = require("../../lib/template"),
parser  = require("../../lib/parser"),
BindableObject = require("bindable-object");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can register a component", function () {

    var tpl = template("<hello />", {
      components: {
        hello: function (section) {
          console.log("OK");
        }
      }
    });

  });
});