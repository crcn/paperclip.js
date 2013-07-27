Clip      = require "./clip"
paper     = require "./paper"
browser   = require "./browser"
translate = require "./translate"


module.exports = browser

# node
module.exports.compile  = translate.compile
paper.template.compiler = translate
