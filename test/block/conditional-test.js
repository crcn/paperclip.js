var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe("conditional#", function () {

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

    var c = new bindable.Object({
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

    var c = new bindable.Object({
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
});