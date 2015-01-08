var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object"),
nofactor = require("nofactor"),
Application = require("mojo-application")

describe(__filename + "#", function () {


  describe("shim", function () {
    it("can be registered & used", function () {

      var i = 0;

      pc.attrBinding("data-href", pc.BaseAttrBinding.extend({
        bind: function (context) {
          pc.BaseAttrBinding.prototype.bind.call(this, context);
        },
        didChange: function (value) {
          i++;
          expect(value).to.be("home");
        }
      }));

      var v = pc.template("<a data-href='home'></a>").view();
      v.render();
      expect(i).to.be(1);
    });
  });
 

});