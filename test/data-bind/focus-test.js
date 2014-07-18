var pcc   = require("../.."),
pc       = pcc(),
expect   = require("expect.js"),
bindable = require("bindable"),
nofactor = require("nofactor");

describe("data-bind focus#", function () {

  var app = new pcc.Application({ nodeFactory: nofactor.dom });

  it("can focus on an input", function (next) {


    var ctx = new bindable.Object({
      focus: false,
      onFocus: function (e) {
        expect(e.type).to.be("focusin");
        next();
      }
    })

    var t = pc.template(
      "<input data-bind='{{" +
        "onFocusIn: onFocus(event), " +
        "focus: focus" +
      "}}'></input>"
    , app).bind(ctx); 

    ctx.set("focus", true);
  });
});