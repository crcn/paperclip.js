var expect     = require("expect.js"),
pc             = require("../..")
template       = pc.template,
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("passes attribute properties to the context of a template view", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message='world' />", {
      components: {
        hello: htpl.createComponentClass()
      }
    });
    expect(tpl.view().toString()).to.be("hello world!");
  });

  it("binds attribute properties to the context of a template view", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message={{message}} />", {
      components: {
        hello: htpl.createComponentClass()
      }
    });

    var v = tpl.view({message:"a"});
    expect(stringifyView(v)).to.be("hello a!");
    v.set("message", "b");
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("hello b!");
  });

  it("attributes don't override context properties", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message='world' />", {
      components: {
        hello: htpl.createComponentClass()
      }
    });

    var v = tpl.view({message:"a"});
    expect(stringifyView(v)).to.be("hello world!");
    // v.runner.update();
    expect(v.context.message).to.be("a");
  });

  it("properly unbinds the template component", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message={{message}} />", {
      components: {
        hello: htpl.createComponentClass()
      }
    });

    var v = tpl.view({message:"world"});
    expect(stringifyView(v)).to.be("hello world!");
    v.unbind();
    v.set("message", "a");
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("hello world!");
  });

});