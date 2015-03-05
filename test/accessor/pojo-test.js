var assert     = require("assert"),
pc             = require("../..")
template       = pc.template;
POJOAccessor   = require("../../lib/accessors/pojo");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  var accessor;

  beforeEach(function () {
    accessor = new POJOAccessor();
  });

  it("can call a method on an object", function () {
    assert.equal(accessor.call({ a: function(){ return true; }}, "a"), true);
  });

  it("won't call a method if it doesn't exist", function () {
    assert.equal(accessor.call({}, "a"), void 0);
  });

  it("doesn't do anything to normalize an object", function () {
    var obj = {};
    assert.equal(accessor.normalizeObject(obj), obj);
  });

  it("can watch for a change event on an array", function () {
    var arry = [];
    var i = 0;
    var obs = accessor.watchEvent(arry, "change", function () {
      i++;
    });
    assert.equal(i, 0);
    arry.push(1, 2);
    accessor.apply();
    assert.equal(i, 1);
    arry.splice(1,1);
    accessor.apply();
    assert.equal(i, 2);

    // dispose - get rid of listener
    obs.dispose();
    arry.push(1);
    accessor.apply();
    assert.equal(i, 2);
  });

  it("can dispose a watcher multiple times", function () {
    var obj = { a: 1}, i = 0;
    var obs = accessor.watchProperty(obj, "a", function () {
      i++;
    });
    obj.a = 2;
    accessor.apply();
    accessor.apply();
    assert.equal(i, 1);
    obj.a = 3;
    accessor.apply();
    assert.equal(i, 2);

    obs.dispose();
    obj.a = 4;
    assert.equal(i, 2);
    obs.dispose();
  });

  it("can watch any other event on an object", function () {
    var obj = {};
    var obs = accessor.watchEvent(obj, "change");
    obs.dispose();
  });
});