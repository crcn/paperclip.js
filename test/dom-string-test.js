var paperclip = require("../"),
templates = require("./templates"),
bindable = require("bindable");


describe("DOM test", function() {



	it("can render a helloWorld template", function() {
		var paper = paperclip.paper(templates.helloWorld);
		
		paper.load(paperclip.writers.String(new bindable.Object({
			name: "Craig"
		})));

		console.log(paper.node.target.toString());
	});
});