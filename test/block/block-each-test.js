var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe(__filename + "#", function () {

  it("can loop through a collection of item", function () {
    var tpl = pc.template("{{#each:source}}{{model}}{{/}}");

    var view = tpl.bind({ source: [1, 2, 3, 4, 5 ]});

    expect(view.render().toString()).to.be("12345");
  });

  it("can replace a source", function () {
    var tpl = pc.template("{{#each:source}}{{model}}{{/}}");

    var view = tpl.bind({ source: [1, 2, 3, 4, 5 ]});

    expect(view.render().toString()).to.be("12345");
    view.context.set("source", [6, 7, 8, 9, 10, 11, 12]);
    expect(view.render().toString()).to.be("6789101112");
    view.context.set("source", [6, 7, 8, 9, 10, 11]);
    expect(view.render().toString()).to.be("67891011");
  });
});
