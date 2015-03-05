var pc   = require("../.."),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {


  it("can register a custom attribute", function () {

    var tpl = template("<div hello />", {
      attributes: {
        hello: pc.Attribute.extend({
          initialize: function () {
            this.node.appendChild(this.nodeFactory.createTextNode("hello world!"));
          }
        })
      }
    });

    var v = tpl.view({});
    assert.equal(stringifyView(v), "<div>hello world!</div>");
  });

});