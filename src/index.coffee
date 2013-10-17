Clip      = require "./clip"
paper     = require "./paper"
browser   = require "./browser"
translate = require "./translate"
adapters  = require "./node/adapters"


require("./node")

module.exports = browser

# node
module.exports.compile    = translate.compile
module.exports.translator = translate

# express
module.exports.adapters = adapters

# register so that strings are compiled
paper.template.compiler = translate

