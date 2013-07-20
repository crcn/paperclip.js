var paperclip = require("../"),
templates     = require("./templates"),
bindable      = require("bindable"),
expect        = require("expect.js");

describe("section test", function() {

  var paper = paperclip.paper(templates.sectionBinding),
  blockValuePaper = paperclip.paper(templates.blockValue),
  writer,
  person = new bindable.Object({
    name: {
      first: "Craig",
      last: "C"
    }
  })
  sectionInfo = new bindable.Object({ 
    sections: {
      blockValue: blockValuePaper.load(person)
    } 
  });

  it("can insert a simple hello message", function() {
     writer = paper.load(person);
     console.log(writer.toString())
  });
});