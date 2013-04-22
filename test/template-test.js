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

  it("it can use inline modifiers", function() {
    var template = new Template("{{ ('hello ' + name + '!') | uppercase() }}, what's up??"), obj;
    var renderer = template.render(obj = new bindable.Object({ name: "liam" }));
    expect(renderer.text).to.be("HELLO LIAM!, what's up??");
    obj.set("name", "frank");
    expect(renderer.text).to.be("HELLO FRANK!, what's up??");
  });



  it("can listen for on-change event", function() {
    var template = new Template("hello {{name}}!"), obj;
    var renderer = template.render(obj = new bindable.Object({ name: "claudia" })),
    text;
    renderer.bind("text", function(value) {
      text = value;
    });

    expect(text).to.be("hello claudia!");
    obj.set("name", "monica");
    expect(text).to.be("hello monica!");
  });
});