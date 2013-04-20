var Template = require("../").Paper.Template,
bindable = require("bindable"),
expect = require("expect.js");

describe("template", function() {

  it("it can parse a simple template", function() {
    var template = new Template("hello {{name}}, you are {{age}} years old!"),
    obj;

    var renderer = template.render(obj = new bindable.Object({ name: "craig", age: 23 }));

    expect(renderer.text).to.be("hello craig, you are 23 years old!");

    obj.set("name", "jake");
    expect(renderer.text).to.be("hello jake, you are 23 years old!");
    obj.set("age", 99);
    expect(renderer.text).to.be("hello jake, you are 99 years old!");
  });
})