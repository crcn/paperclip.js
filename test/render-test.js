var fs            = require("fs");
var pc            = require("../");
var path          = require("path");
var expect        = require("expect.js");
var stringifyView = require("./utils/stringifyView");

describe(__filename + "#", function() {

  var filesdir = path.join(__dirname, "_files");

  var files = fs.readdirSync(filesdir).filter(function(file) {
    return /\.pc$/.test(file);
  });

  files.forEach(function(file) {
    it("can render " + file, function() {

      var name     = file.split(".").shift();
      var template = pc.template(fs.readFileSync(path.join(filesdir, file), "utf8"));
      var view     = template.view(require(path.join(filesdir, name + ".js")));
      view.render();
      var output = fs.readFileSync(path.join(filesdir, name + ".txt"), "utf8");
      output = output.replace(/\n+\s*/g,"");
      expect(stringifyView(view)).to.be(output);
    });
  })
});
