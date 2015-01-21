var pc   = require("../.."),
expect   = require("expect.js"),
BindableCollection = require("bindable-collection");

describe(__filename + "#", function () {

  it("can loop through a collection of item", function () {
    var tpl = pc.template("{{#each:source,as:'model'}}{{model}}{{/}}");

    var view = tpl.bind({ source: [1, 2, 3, 4, 5 ]});

    expect(view.render().toString()).to.be("12345");
  });

  it("can replace a source", function () {
    var tpl = pc.template("{{#each:source,as:'model'}}{{model}}{{/}}");

    var view = tpl.bind({ source: [1, 2, 3, 4, 5 ]});

    expect(view.render().toString()).to.be("12345");
    view.context.set("source", [6, 7, 8, 9, 10, 11, 12]);
    expect(view.render().toString()).to.be("6789101112");
    view.context.set("source", [6, 7, 8, 9, 10, 11]);
    expect(view.render().toString()).to.be("67891011");
  });

  it("can allocate a certain number of items", function () {
    var tpl = pc.template("{{#each:source,allocate:10,chunk:10}}a{{/}}");
    var view = tpl.bind();
  });

  it("can nest each blocks", function () {
    var tpl = pc.template("{{#each:source,as:'a'}}a{{#each:a,as:'b'}}{{b}}{{/}}{{/}}");
    var view = tpl.bind({ source: [[1,2], [3,4], [5,6], [7,8], [9,10]]});
    expect(view.render().toString()).to.be("a12a34a56a78a910");
    var view = tpl.bind({ source: [[11,12], [13,14,15]]});
    expect(view.render().toString()).to.be("a1112a131415");
  });


  it("can loop through a collection of item", function () {
    var tpl = pc.template("{{#each:source,as:'a'}}{{a}}{{/}}");

    var view = tpl.bind({ source: [1, 2, 3, 4, 5 ]});

    expect(view.render().toString()).to.be("12345");
  });

  it("properly inherits properties from the parent view", function () {
    var tpl = pc.template("{{#each:source,as:'a'}}{{a}}{{name}}{{/}}");

    var view = tpl.bind({ source: [1, 2, 3, 4, 5 ], name: 'b'});

    expect(view.render().toString()).to.be("1b2b3b4b5b");
  });

  it("accepts bindable collections as source", function () {
    var tpl = pc.template("{{#each:source,as:'a'}}{{a}}{{/}}");
    var view = tpl.bind({ source: new BindableCollection([1,2,3,4,5])});
    expect(view.render().toString()).to.be("12345");
  });

  it("updates the template if the source changes", function () {
    var tpl = pc.template("{{#each:source,as:'a'}}{{a}}{{/}}"), src;
    var view = tpl.bind({ source: src = new BindableCollection([1,2,3,4,5])});
    expect(view.render().toString()).to.be("12345");
    src.splice(0, 1);
    expect(view.toString()).to.be("2345");
    src.splice(0, 0,-1,0,1);
    expect(view.toString()).to.be("-1012345");
  });

  it("can be sorted", function () {
    var tpl = pc.template("{{#each:source,as:'a',sort:sorter}}{{a}}{{/}}");
    var view = tpl.bind({source:[5,4,3,2,1], sorter: function (a, b) {
      return a > b ? 1 : -1;
    }});

    expect(view.render().toString()).to.be("12345");
  })
});
