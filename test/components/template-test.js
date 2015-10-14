var assert     = require("assert"),
pc             = require("../../")
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
        hello: htpl
      }
    });
  assert.equal(tpl.view({}).toString(), "hello world!");
  });

  it("binds attribute properties to the context of a template view", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message={{message}} />", {
      components: {
        hello: htpl
      }
    });

    var v = tpl.view({message:"a"});
    assert.equal(stringifyView(v), "hello a!");
    v.set("message", "b");
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "hello b!");
  });

  it("attributes don't override context properties", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message='world' />", {
      components: {
        hello: htpl
      }
    });

    var v = tpl.view({message:"a"});
    assert.equal(stringifyView(v), "hello world!");
    // v.runner.update();
    assert.equal(v.context.message, "a");
  });

  xit("properly unbinds the template component", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message={{message}} />", {
      components: {
        hello: htpl
      }
    });

    var v = tpl.view({message:"world"});
    assert.equal(stringifyView(v), "hello world!");
    // v.unbind();
    v.set("message", "a");
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "hello world!");
  });

});
