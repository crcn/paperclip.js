var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object");

describe(__filename + "#", function () {

  it("can show conditional content", function () {
    var t = pc.template(
      "hello {{#if:true}}" +
        "world" + 
      "{{/}}"
    ).bind();

    expect(t.toString()).to.be("hello world");
  });

  it("can hide conditional content", function () {
    var t = pc.template(
      "hello {{#if:false}}" +
        "world" + 
      "{{/}}"
    ).bind();

    expect(t.toString()).to.be("hello ");
  });

  it("can show an 'else' block", function () {
    
    var t = pc.template(
      "hello {{#if:false}}" +
        "world" + 
      "{{/else}}" + 
        "blah" +
      "{{/}}"
    ).bind();

    expect(t.toString()).to.be("hello blah");
  });

  it("can show an 'elseif' block", function () {
    
    var t = pc.template(
      "hello {{#if:false}}" +
        "world" + 
      "{{/elseif: true}}" + 
        "blah" +
      "{{/}}"
    ).bind();

    expect(t.toString()).to.be("hello blah");
  });


  it("can toggle between different blocks", function () {

    var c = new BindableObject({
      a: true,
      b: true
    })
    
    var t = pc.template(
      "hello {{#if:a}}" +
        "a" + 
      "{{/elseif:b}}" + 
        "b" +
      "{{/else}}" + 
        "c" + 
      "{{/}}"
    ).bind(c);


    expect(t.toString()).to.be("hello a");
    c.set("a", false);
    expect(t.toString()).to.be("hello b");
    c.set("a", true);
    expect(t.toString()).to.be("hello a");
    c.set("a", false);
    c.set("b", false);
    expect(t.toString()).to.be("hello c");
    c.set("a", true);
    expect(t.toString()).to.be("hello a");
  });

  it("nest conditional statements", function () {

    var c = new BindableObject({
      a: true,
      b: true
    });

    var t = pc.template(
      "hello {{#if:a}}" +
        "{{#if:b}}" + 
          "b" +
        "{{/else}}" + 
          "a" + 
        "{{/}}" + 
      "{{/elseif:b}}" + 
        "bb" +
      "{{/else}}" + 
        "c" + 
      "{{/}}"
    ).bind(c);

    expect(t.toString()).to.be("hello b");
    c.set("b", false);
    expect(t.toString()).to.be("hello a");
    c.set("a", false);
    expect(t.toString()).to.be("hello c");
    c.set("b", true);
    expect(t.toString()).to.be("hello bb");
  });

  it("can show a conditional else if the false is undefined", function () {

    var t = pc.template(
      "{{#if:doesNotExist}}" +
        "yes" +
      "{{/else}}" +
        "showing else" +
      "{{/}}"
    ).view();

    expect(t.toString()).to.be("showing else");
  })


  it("can be re-used after being disposed", function () {

    var c = new BindableObject({
      running: true,
      show: true
    });

    var t = pc.template(
      "{{#if:running}}" +
        "yes" +
      "{{/else}}" +
        "no" +
      "{{/}}"
    ).bind(c);

    expect(t.toString()).to.be("yes");

    t.dispose();
    
    expect(t.bind(c).toString()).to.be("yes");
  })
});
