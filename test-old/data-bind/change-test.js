var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable"),
nofactor = require("nofactor");

describe("data-bind change#", function () {


  var app = new pc.Application({ nodeFactory: nofactor.dom });
  app.use(pc);

  [
    "keydown",
    "change",
    "input",
    "mousedown",
    "mouseup",
    "click"
  ].forEach(function (event) {
    it("triggers an onChange event when " + event + " is emitted", function (next) {

      var t = pc.template(
        "<div data-bind='{{" +
          "onChange: onEvent(event)" +
        "}}'></div>"
      , app).bind({
        onEvent: function (e) {
          expect(e.type).to.be(event);
          next();
        }
      }); 

      $(t.node).trigger(event);
    });
  });
});