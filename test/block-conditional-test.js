var pc    = require(".."),
expect    = require("expect.js"),
bindable  = require("bindable"),
utils     = require("./utils");

/**
 * tests for sections. For instance:
 * {{ html: subView }}
 */

describe("conditional sections", function() {

  it("show up with a true statement", function() {
    var v = pc.template("hello{{#if:true}} world{{/}}!").bind();
    expect(String(v)).to.be("hello world!");
  });
  return;

  it("don't show up with an undefined value", function() {
    var v = pc.template("hello{{#if:undefined}} world{{/}}!").bind();

    expect(String(v)).to.be("hello!");
  });

  it("show up with a true statement", function() {
    var v = pc.template("hello{{#if:true}} world{{/}}!").bind();
    expect(String(v)).to.be("hello world!");
  });

  

  describe("with else statements", function() {
    it("can show / hide conditional blocks", function() {
      var v = pc.template("{{#if:show}}hello world!{{/}}").bind();
      expect(String(v)).to.be("");
      v.context.set("show", true);
      expect(String(v)).to.be("hello world!");
      v.context.set("show", false);
      expect(String(v)).to.be("");

    });

    it("are shown if 'if' is false", function() {
      var v = pc.template("hello{{#if:undefined}} world{{/else}} blah{{/}}!").bind();
      expect(String(v)).to.be("hello blah!");
    });



    it("waterfalls down conditional statements", function() {

    

      var v = pc.template("\
        {{#if: color == 'red' }} \
          {{color}} is an intimidating color. \
        {{/elseif: color == 'yellow' }} \
          {{color}} is a warning color. \
        {{/else}} \
          I don't know the color {{color}}. \
        {{/}} \
      ").bind({
        color: "red"
      });

      expect(utils.trim(v)).to.be("red is an intimidating color.");
      v.context.set("color", "yellow");
      expect(utils.trim(v)).to.be("yellow is a warning color.");
      v.context.set("color", "black");
      expect(utils.trim(v)).to.be("I don't know the color black.");
      v.context.set("color", "yellow");
      expect(utils.trim(v)).to.be("yellow is a warning color.");
      v.context.set("color", "red");
      expect(utils.trim(v)).to.be("red is an intimidating color.");


    });

  });
});