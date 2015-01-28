var expect     = require("expect.js"),
pc             = require("../../lib")
template       = pc.template;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {


  it("can show conditional content", function () {
    var v = pc.template(
      "a <switch>" +
        "<show when={{true}}>" + 
          "b" +
        "</show>" +
      "</switch>"
    , pc).view();


    expect(v.toString()).to.be("a b");
  });

  it("cascades show statements", function () {
    var v = pc.template(
      "a <switch>" +
        "<show when={{false}}>" + 
          "b" +
        "</show>" +
        "<show when={{true}}>" + 
          "c" +
        "</show>" +
      "</switch>"
    , pc).view();


    expect(v.toString()).to.be("a c");
  });

  it("shows an item if there is now 'when' attribute", function () {
    var v = pc.template(
      "a <switch>" +
        "<show when={{false}}>" + 
          "b" +
        "</show>" +
        "<show>" + 
          "c" +
        "</show>" +
        "<show when={{false}}>" + 
          "d" +
        "</show>" +
      "</switch>"
    , pc).view();


    expect(v.toString()).to.be("a c");
  });

  it("doesn't show any items if there are no matches", function () {
    var v = pc.template(
      "a <switch>" +
        "<show when={{false}}>" + 
          "b" +
        "</show>" +
        "<show when={{false}}>" + 
          "d" +
        "</show>" +
      "</switch>"
    , pc).view();


    expect(v.toString()).to.be("a ");
  });

  it("dynamically toggles between show statements", function () {
    var v = pc.template(
      "a <switch>" +
        "<show when={{a}}>" + 
          "b" +
        "</show>" +
        "<show when={{b}}>" + 
          "c" +
        "</show>" +
        "<show when={{c}}>" + 
          "d" +
        "</show>" +
      "</switch>"
    , pc).view({});


    expect(v.toString()).to.be("a ");
    v.context.set("a", true);
    expect(v.toString()).to.be("a b");
    v.context.set("a", false);
    v.context.set("b", true);
    expect(v.toString()).to.be("a c");
    v.context.set("b", false);
    v.context.set("c", true);
    expect(v.toString()).to.be("a d");
    v.context.set("a", true);
    expect(v.toString()).to.be("a b");
  });

  it("can embed a switch statement", function () {
    var v = pc.template(
      "a <switch>" +
        "<show when={{a}}>" + 
          "<switch>" +
            "<show when={{a2}}>" +
              "b2" +
            "</show>" +
            "<show when={{a3}}>" +
              "b3" +
            "</show>" +
            "<show>" +
              "b4" +
            "</show>" +
          "</switch>" +
        "</show>" +
        "<show when={{b}}>" + 
          "c" +
        "</show>" +
      "</switch>"
    , pc).view({});

    expect(v.toString()).to.be("a ");
    v.context.set("a", true);
    expect(v.toString()).to.be("a b4");
    v.context.set("a2", true);
    expect(v.toString()).to.be("a b2");
    v.context.set("a2", false);
    v.context.set("a3", true);
    expect(v.toString()).to.be("a b3");
    v.context.set("a", false);
    v.context.set("b", true);
    expect(v.toString()).to.be("a c");
  });

  it("shows the else if when is undefined", function () {
    var v = pc.template(
      "a <switch>" +
        "<show when={{undefined}}>" + 
          "b" +
        "</show>" +
        "<show>" + 
          "c" +
        "</show>" +
      "</switch>"
    , pc).view({});

    expect(v.toString()).to.be("a c");
  })
});

