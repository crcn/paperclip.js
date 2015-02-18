var pc   = require("../.."),
expect   = require("expect.js"),
nodeFactory = require("nofactor/lib/dom"),
defaultNodeFactory = require("nofactor"),
paperclip = require("../.."),
stringifyView = require("../utils/stringifyView"),
template = paperclip.template;

describe(__filename + "#", function () {

  before(function () {
    paperclip.nodeFactory = nodeFactory;
  });


  after(function () {
    paperclip.nodeFactory = defaultNodeFactory;
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

      var e = document.createEvent("Event");
      e.initEvent(name.toLowerCase(), true, true);
      t.section.node.dispatchEvent(e);
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



    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 13;
    t.render().dispatchEvent(e);


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

    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 8;
    t.render().dispatchEvent(e);
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

    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 27;
    t.render().dispatchEvent(e);
  });

  it("doesn't catch events outside of escape event keycode", function () {
    var i = 0;
    var t = pc.template(
      "<div onEscape='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , paperclip).view({
      onEvent: function (event) {
        i++;
      }
    }); 

    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 30;
    t.render().dispatchEvent(e);
    expect(i).to.be(0);
  });


  it("cannot trigger an event if a view is unbound", function () {
    var i = 0;
    var t = pc.template(
      "<div onEscape='{{" +
        "onEvent(event)" +
      "}}'></div>"
    , paperclip).view({
      onEvent: function (event) {
        i++;
      }
    }); 

    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 27;
    t.render().dispatchEvent(e);
    expect(i).to.be(1);
    t.unbind();
    t.section.node.dispatchEvent(e);
    expect(i).to.be(1);
  });
});