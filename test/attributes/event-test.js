var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object"),
nofactor = require("nofactor"),
Application = require("mojo-application");

describe(__filename + "#", function () {


  var app = new Application({ nodeFactory: nofactor.dom });
  app.use(pc);

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
        "<div on"+name.substr(0, 1).toUpperCase() + name.substr(1)+"='{{" +
          "onEvent(event)" +
        "}}'></div>"
      , app).bind({
        onEvent: function (event) {
          expect(event.type).to.be(name.toLowerCase());
          next();
        }
      });

      t.render(); 

      var e = document.createEvent("event");
      e.initEvent(name.toLowerCase());
      t.node.dispatchEvent(e);
    });
  });


  it("can capture an onEnter event", function (next) {

    var t = pc.template(
      "<div onEnter='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , app).bind({
      onEvent: function (event) {
        next();
      }
    }); 



    var e = document.createEvent("event");
    e.initEvent("keydown");
    e.keyCode = 13;
    t.node.dispatchEvent(e);


    t.dispose();
  });

  it("can capture an onDelete event", function (next) {

    var t = pc.template(
      "<div onDelete='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , app).bind({
      onEvent: function (event) {
        next();
      }
    }); 

    var e = document.createEvent("event");
    e.initEvent("keydown");
    e.keyCode = 8;
    t.node.dispatchEvent(e);
  });

  it("can capture an onEscape event", function (next) {

    var t = pc.template(
      "<div onEscape='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , app).bind({
      onEvent: function (event) {
        next();
      }
    }); 

    var e = document.createEvent("event");
    e.initEvent("keydown");
    e.keyCode = 27;
    t.node.dispatchEvent(e);
  });
});