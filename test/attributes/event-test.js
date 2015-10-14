var pc   = require("../../"),
assert   = require("assert"),
paperclip = require("../../"),
stringifyView = require("../utils/stringifyView"),
template = paperclip.template;

describe(__filename + "#", function () {



  [
    "click",
    "dblclick",
    "load",
    "submit",
    "mousedown",
    "mousemove",
    "mouseup",
    "change",
    "mouseover",
    "mouseout",
    "focus",
    "blur",
    "keydown",
    "keyup",
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
    "selectstart",
    "drop"
  ].forEach(function (event) {

    var ep = event.split(":"),
    name   = ep.shift(),
    nevent = (ep.shift() || name).toLowerCase();

    it("can capture a " + name + " event", function (next) {

      var t = paperclip.template(
        "<div on"+name+"={{" +
          "onEvent" +
        "}}></div>"
      ).view({
        onEvent: function (event) {
          assert.equal(event.type, name.toLowerCase());
          next();
        }
      });

      t.render();

      var e = document.createEvent("Event");
      e.initEvent(name.toLowerCase(), true, true);
      t.section.node.dispatchEvent(e);
    });
  });

  it("does not prevent dragstart events", function (next) {
    var t = pc.template(
      "<div ondragstart={{" +
      "onDragStart" +
      "}}></div>"
      , paperclip).view({
        onDragStart: function (event) {
          if (!event.defaultPrevented) {
            next();
          }
        }
      });

    var e = document.createEvent("Event");
    e.initEvent("dragstart", true, true);
    t.render().dispatchEvent(e);

  });

  it("does not prevent dragend events", function (next) {
    var t = pc.template(
      "<div ondragend={{" +
      "onDragEnd" +
      "}}></div>"
      , paperclip).view({
        onDragEnd: function (event) {
          if (!event.defaultPrevented) {
            next();
          }
        }
      });

    var e = document.createEvent("Event");
    e.initEvent("dragend", true, true);
    t.render().dispatchEvent(e);
  });


  it("can capture an onEnter event", function (next) {

    var t = pc.template(
      "<div onenter={{" +
        "onEvent" +
      "}}></div>"
    , paperclip).view({
      onEvent: function (event) {
        next();
      }
    });



    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 13;
    t.render().dispatchEvent(e);

  });

  it("can capture an onDelete event", function (next) {

    var t = pc.template(
      "<div ondelete={{" +
        "onEvent" +
      "}}></div>"
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
      "<div onescape={{" +
        "onEvent" +
      "}}></div>"
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
      "<div onEscape={{" +
        "onEvent" +
      "}}></div>"
    , paperclip).view({
      onEvent: function (event) {
        i++;
      }
    });

    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 30;
    t.render().dispatchEvent(e);
    assert.equal(i, 0);
  });


  it("cannot trigger an event if a view is unbound", function () {
    var i = 0;
    var t = pc.template(
      "<div onescape={{" +
        "onEvent" +
      "}}></div>"
    , paperclip).view({
      onEvent: function (event) {
        i++;
      }
    });

    var e = document.createEvent("Event");
    e.initEvent("keydown", true, true);
    e.keyCode = 27;
    t.render().dispatchEvent(e);
    assert.equal(i, 1);
    t.set("onEvent", void 0);
    t.section.node.dispatchEvent(e);
    assert.equal(i, 1);
  });
});
