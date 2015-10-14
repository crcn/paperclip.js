var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {


  it("can register a custom attribute", function () {

    var tpl = pc.template("<div hello />", {
      attributes: {
        hello: pc.Attribute.extend({
          initialize: function () {
            this.node.appendChild(this.document.createTextNode("hello world!"));
          }
        })
      }
    });

    var v = tpl.view({});
    assert.equal(stringifyView(v), "<div>hello world!</div>");
  });

  it("can specify an attribute without a value", function() {
    var tpl = pc.template("<div abba>baab</div>", {});

    var v = tpl.view({});
    assert.equal(stringifyView(v), "<div abba=\"true\">baab</div>");
  });
});
