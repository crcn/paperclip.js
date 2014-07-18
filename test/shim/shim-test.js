var pc = require("../.."),
structr = require("structr"),
expect = require("expect.js");

describe("shim#", function() {


  var PlaceholderShim = structr(pc.BaseNodeBinding, {
    type: "attr",
    "override bind": function(context) {
      this._super(context);
      this.node.setAttribute("data-shimPlaceholder", "true");
    },
    "test": function(bindable) {
      return bindable.node.nodeName == "INPUT";
    }
  });

  var SelectShim = structr(pc.BaseNodeBinding, {
    type: "node",
    "override bind": function(context) {
      this._super(context);
      this.node.setAttribute("data-shimSelect", "true");
    }
  });

  var DataBindShim = structr(pc.BaseAttrDataBinding, {
    "override bind": function(context) {
      this._super(context);
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
