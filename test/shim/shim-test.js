var pc = require("../.."),
structr = require("structr"),
expect = require("expect.js"),
Application  = require("mojo-application");

var apc = Application.main.paperclip;

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
    apc.nodeBinding("placeholder", PlaceholderShim);
    var v = pc.template("<input placeholder=\"Username:\" />").bind();
    expect(String(v)).to.contain("<input placeholder=\"Username:\" data-shimplaceholder=\"true\">");
  });

  it("can ignore certain types of nodes", function() {
    var v = pc.template("<div placeholder=\"Username:\"></div>").bind();

    expect(String(v)).to.be('<div placeholder="Username:"></div>');
  });

  it("can be added as a node", function() {
    apc.nodeBinding("select", SelectShim);
    var v = pc.template("<select></select>").bind();
    expect(String(v)).to.be('<select data-shimselect="true"></select>');
  });

  it("can be added as a data-bind", function() {
    apc.attrDataBinding("dataBind", DataBindShim);
    var v = pc.template("<div data-bind=\"{{dataBind:true}}\"></div>").bind();
    expect(String(v)).to.be('<div data-databind="true"></div>');
  });
});
