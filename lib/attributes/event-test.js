var EventAttribute = require("./event");
var extend         = require("xtend/mutable");
var template       = require("../template");
var expect         = require("expect.js");

describe(__filename + "#", function() {

  /**
   */

  it("can register a custom event handler", function() {

    var tpl = template("<span onEvent='{{handleEvent}}'></span>", {
      attributes: {
        "onEvent": EventAttribute
      }
    });

    var v = tpl.view({
      handleEvent: function(event) {

      }
    });

    var e = document.createEvent("Event");
    e.initEvent("event", true, true);
    v.render().dispatchEvent(e);
    // expect()
  });
});
