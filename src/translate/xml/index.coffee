Parser = require "./parser"
p = new Parser()
fs = require "fs"

expr = p.parse fs.readFileSync(__dirname + "/../../../test.html", "utf8")

console.log String expr