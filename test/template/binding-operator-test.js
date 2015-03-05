var pc   = require("../.."),
assert   = require("assert");


describe(__filename + "#", function () {


  it("can ignore a reference with ~", function () {
    var c = {
      a: "a"
    }, t = pc.template("{{~a}}").view(c);
    assert.equal(t.toString(), "a");
    t.set("a", "b");
    assert.equal(t.toString(), "a");
  });

  it("can use a data-binding with an or statement", function () {
    var c = {};
    pc.template("{{a||<~>a}}").view(c);
    pc.template("{{a||~a}}").view(c);
    pc.template("{{a||<~a}}").view(c);
    pc.template("{{a||~>a}}").view(c);
  });

  xit("<~ can bind a reference, but not be settable", function () {
    var c ={
      a: "a"
    }, t = pc.template("{{<~a}}").view(c);
    assert.equal(t.toString(), "a");
    t.set("a", "b");
    assert.equal(t.toString(), "b");
    var ref = t.clips._clips[0].script.evaluate(t.scope);

    assert.equal(ref.__isBindableReference, true);
    ref.value("baab");
    assert.equal(ref.value(), "b");
  });


  xit("drops ~> refs from being watched, but casts them s a bindable ref", function () {
    var c = {
      a: "a"
    }, t = pc.template("{{~>a}}").view(c);
    assert.equal(t.toString(), "a");
    var ref = t.clips._clips[0].script.evaluate(t.scope);

    assert.equal(t.clips._clips[0].script.refs.length, 0);
    assert.equal(ref.__isBindableReference, true);
    ref.value("b");
    assert.equal(t.toString(), "a");
  });

  xit("allows for references with <~> to be bound both ways", function () {
    var c = {
      a: "a"
    }, t = pc.template("{{<~>a}}").view(c);
    assert.equal(t.toString(), "a");
    var ref = t.clips._clips[0].script.evaluate(t.scope);
    assert.equal(t.clips._clips[0].script.refs.length, 1);
    assert.equal(ref.__isBindableReference, true);
    assert.equal(ref.value(), "a");
    ref.value("b");
    assert.equal(t.toString(), "b");
  });
  
});
