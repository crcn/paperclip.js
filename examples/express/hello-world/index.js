var pc = require("../../../"),
express = require("express"),
app = express();

app.engine("pc", pc.adapters.express);
app.set("views", __dirname + "/views");


app.get("/hello", function(req, res) {
  res.render("index.pc", {
    name: req.query.name,
    last: req.query.last
  });
});

app.get("/complete", function(req, res) {
  res.render("complete.pc", {
    teacherName: req.query.teacherName
  });
});

app.listen(8081);