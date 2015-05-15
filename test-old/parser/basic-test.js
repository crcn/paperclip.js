var parser = require("../../lib/parser"),
template   = require("../../lib/template"),
assert     = require("assert");

describe(__filename + "#", function () {

  it("can properly parse a tpl", function () {
    parser.parse("a");
  });


  [
    "area",
    "base",
    "br",
    "col",
    "command",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ].forEach(function (nodeName) {

    it("can parse the " + nodeName + " void element without child nodes", function () {
      parser.parse("<div><" + nodeName + "></div>");
    });

    it("can parse the " + nodeName + " void element with attrs and without child nodes", function () {
      parser.parse("<div><" + nodeName + " ab='c' d></div>");
    });

    it("can parse the " + nodeName + " void element with a closing tag", function () {
      parser.parse("<" + nodeName + "></" + nodeName + ">");
    });

    it("can parse the " + nodeName + " void element with a closing tag and no children", function () {
      parser.parse("<" + nodeName + " />");
    });

    it("can parse the " + nodeName + " void element with attrs and with closing tag", function () {
      parser.parse("<" + nodeName + " ab='c' d />");
    });


    it("cannot parse the " + nodeName + " void element with child nodes", function () {
      assert.throws(function () {
        parser.parse("<" + nodeName + " />abba</" + nodeName + ">");
      }, Error);
    });
  });


});