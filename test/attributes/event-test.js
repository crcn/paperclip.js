var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object"),
nofactor = require("nofactor"),
paperclip = require("../../lib"),
template = paperclip.template;

describe(__filename + "#", function () {

  before(function () {
    paperclip.nodeFactory = nofactor.dom;
  });


  after(function () {
    paperclip.nodeFactory = nofactor.default;
  });


  [
    "click", 
    "doubleClick:dblclick",
    "load", 
    "submit", 
    "mouseDown", 
    "mouseMove", 
    "mouseUp",
    "change",
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

    it("can capture a " + name + " event", function (next) {

      var t = template(
        "<div on"+name.substr(0, 1).toUpperCase() + name.substr(1)+"='{{" +
          "onEvent(event)" +
        "}}'></div>"
      , paperclip).view({
        onEvent: function (event) {
          expect(event.type).to.be(name.toLowerCase());
          next();
        }
      });

      t.render(); 

      var e = document.createEvent("event");
      e.initEvent(name.toLowerCase());
      t.section.start.nextSibling.dispatchEvent(e);
    });
  });



  it("can capture an onEnter event", function (next) {

    var t = pc.template(
      "<div onEnter='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , paperclip).view({
      onEvent: function (event) {
        next();
      }
    }); 



    var e = document.createEvent("event");
    e.initEvent("keydown");
    e.keyCode = 13;
    t.render().childNodes[1].dispatchEvent(e);


    t.dispose();
  });

  it("can capture an onDelete event", function (next) {

    var t = pc.template(
      "<div onDelete='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , paperclip).view({
      onEvent: function (event) {
        next();
      }
    }); 

    var e = document.createEvent("event");
    e.initEvent("keydown");
    e.keyCode = 8;
    t.render().childNodes[1].dispatchEvent(e);
  });

  it("can capture an onEscape event", function (next) {

    var t = pc.template(
      "<div onEscape='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , paperclip).view({
      onEvent: function (event) {
        next();
      }
    }); 

    var e = document.createEvent("event");
    e.initEvent("keydown");
    e.keyCode = 27;
    t.render().childNodes[1].dispatchEvent(e);
  });
});