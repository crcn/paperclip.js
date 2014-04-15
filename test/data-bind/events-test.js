var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable"),
nofactor = require("nofactor");

describe("data-bind events#", function () {


  var app = new pc.Application({ nodeFactory: nofactor.dom });

  [
    "click", 
    "load", 
    "submit", 
    "mouseDown", 
    "mouseMove", 
    "mouseUp",
    "mouseOver",
    "mouseOut",
    "focusIn:focus",
    "focusOut:blur",
    "keyDown",
    "keyUp"
  ].forEach(function (event) {

    var ep = event.split(":"),
    name   = ep.shift(),
    nevent = (ep.shift() || name).toLowerCase();

    it("can capture an " + name + "event", function (next) {

      var t = pc.template(
        "<div data-bind='{{" +
          "on" + name.substr(0, 1).toUpperCase() + name.substr(1) + ": onEvent(event)" +
        "}}'></div>"
      , app).bind({
        onEvent: function (event) {
          expect(event.type).to.be(name.toLowerCase());
          next();
        }
      }); 

      $(t.node).trigger(nevent);
    });
  });


  it("can capture an onEnter event", function (next) {

    var t = pc.template(
      "<div data-bind='{{" +
        "onEnter: onEvent(event)" +
      "}}'></div>"
    , app).bind({
      onEvent: function (event) {
        next();
      }
    }); 

    var e = $.Event("keydown");
    e.keyCode = 13;
    $(t.node).trigger(e);
    
    // shouldn't trigger
    $(t.node).trigger($.Event("keydown"));

    t.dispose();
  });

  it("can capture an onDelete event", function (next) {

    var t = pc.template(
      "<div data-bind='{{" +
        "onDelete: onEvent(event)" +
      "}}'></div>"
    , app).bind({
      onEvent: function (event) {
        next();
      }
    }); 

    var e = $.Event("keydown");
    e.keyCode = 8;
    $(t.node).trigger(e);

    // shouldn't trigger
    $(t.node).trigger($.Event("keydown"));
  });



});