var expect     = require("expect.js"),
pc             = require("../../lib")
template       = pc.template;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("passes attribute properties to the context of a template view", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message='world' />", {
      components: {
        hello: htpl.component
      }
    });
    expect(tpl.view().render().toString()).to.be("hello world!");
  });

  it("binds attribute properties to the context of a template view", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message={{message}} />", {
      components: {
        hello: htpl.component
      }
    });

    var v = tpl.view({message:"a"});
    expect(v.render().toString()).to.be("hello a!");
    v.context.set("message", "b");
    expect(v.render().toString()).to.be("hello b!");
  });

  it("attributes don't override context properties", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message='world' />", {
      components: {
        hello: htpl.component
      }
    });

    var v = tpl.view({message:"a"});
    expect(v.render().toString()).to.be("hello world!");
    expect(v.context.message).to.be("a");
  });

  it("properly unbinds the template component", function () {
    var htpl = template("hello {{message}}!");
    var tpl = template("<hello message={{message}} />", {
      components: {
        hello: htpl.component
      }
    });

    var v = tpl.view({message:"world"});
    expect(v.render().toString()).to.be("hello world!");
    var ctx = v.context;
    v.unbind(ctx);
    ctx.set("message", "a");
    expect(v.render().toString()).to.be("hello world!");
  });

});