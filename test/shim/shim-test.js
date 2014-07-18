var pcc   = require("../.."),
pc       = pcc(),
structr = require("structr"),
expect = require("expect.js");

describe("shim#", function() {


  var PlaceholderShim = pcc.BaseNodeBinding.extend({
    type: "attr",
    "bind": function(context) {
      pcc.BaseNodeBinding.prototype.bind.call(this, context);
      this.node.setAttribute("data-shimPlaceholder", "true");
    },
    "test": function(bindable) {
      return bindable.node.nodeName == "INPUT";
    }
  });

  var SelectShim = pcc.BaseNodeBinding.extend({
    type: "node",
    "bind": function(context) {
      pcc.BaseNodeBinding.prototype.bind.call(this, context);
      this.node.setAttribute("data-shimSelect", "true");
    }
  });

  var DataBindShim = pcc.BaseAttrDataBinding.extend({
    "bind": function(context) {
      pcc.BaseAttrDataBinding.prototype.bind.call(this, context);
      this.node.setAttribute("data-dataBind", "true");
    }
  });


  it("can be added as an attribute", function() {
    pc.nodeBinding("placeholder", PlaceholderShim);
    var v = pc.template("<input placeholder=\"Username:\"></input>").bind();
    expect(String(v)).to.contain("<input placeholder=\"Username:\" data-shimplaceholder=\"true\"></input>");
  });

  it("can ignore certain types of nodes", function() {
    var v = pc.template("<div placeholder=\"Username:\"></input>").bind();

    expect(String(v)).to.be('<div placeholder="Username:"></div>');
  });

  it("can be added as a node", function() {
    pc.nodeBinding("select", SelectShim);
    var v = pc.template("<select></select>").bind();
    expect(String(v)).to.be('<select data-shimselect="true"></select>');
  });

  it("can be added as a data-bind", function() {
    pc.attrDataBinding("dataBind", DataBindShim);
    var v = pc.template("<div data-bind=\"{{dataBind:true}}\"></div>").bind();
    expect(String(v)).to.be('<div data-databind="true"></div>');
  });
});
