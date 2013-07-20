var fs = require("fs"),
templateParser = require("../../lib/translate");

fs.readdirSync(__dirname).forEach(function(file) {
	if(/index|.DS_Store/.test(file)) return;

	var module = { exports: {} };
	eval(templateParser.parse(fs.readFileSync(__dirname + "/" + file, "utf8")));
	exports[file.split(".").shift()] = module.exports;

});