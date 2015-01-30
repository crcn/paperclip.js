var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object");


describe(__filename + "#", function () {


  it("can ignore a reference with ~", function () {
    var c = new BindableObject({
      a: "a"
    }), t = pc.template("{{~a}}").view(c);
    expect(t.toString()).to.be("a");
    c.set("a", "b");
    expect(t.toString()).to.be("a");
  });

  xit("<~ can bind a reference, but not be settable", function () {
    var c = new BindableObject({
      a: "a"
    }), t = pc.template("{{<~a}}").view(c);
    expect(t.toString()).to.be("a");
    c.set("a", "b");
    expect(t.toString()).to.be("b");
    var ref = t.clips._clips[0].script.evaluate(t.context);

    expect(ref.__isBindableReference).to.be(true);
    ref.value("baab");
    expect(ref.value()).to.be("b");
  });


  xit("drops ~> refs from being watched, but casts them s a bindable ref", function () {
    var c = new BindableObject({
      a: "a"
    }), t = pc.template("{{~>a}}").view(c);
    expect(t.toString()).to.be("a");
    var ref = t.clips._clips[0].script.evaluate(t.context);

    expect(t.clips._clips[0].script.refs.length).to.be(0);
    expect(ref.__isBindableReference).to.be(true);
    ref.value("b");
    expect(t.toString()).to.be("a");
  });

  xit("can use a data-binding with an or statement", function () {
    var c = new BindableObject();
    pc.template("{{a||<~>a}}").view(c);
    pc.template("{{a||~a}}").view(c);
    pc.template("{{a||<~a}}").view(c);
    pc.template("{{a||~>a}}").view(c);
  });

  xit("allows for references with <~> to be bound both ways", function () {
    var c = new BindableObject({
      a: "a"
    }), t = pc.template("{{<~>a}}").view(c);
    expect(t.toString()).to.be("a");
    var ref = t.clips._clips[0].script.evaluate(t.context);
    expect(t.clips._clips[0].script.refs.length).to.be(1);
    expect(ref.__isBindableReference).to.be(true);
    expect(ref.value()).to.be("a");
    ref.value("b");
    expect(t.toString()).to.be("b");
  });
  
});
