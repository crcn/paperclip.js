var pc   = require("../.."),
expect   = require("expect.js"),
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
    expect(stringifyView(v)).to.be("<div>hello world!</div>");
  });

});