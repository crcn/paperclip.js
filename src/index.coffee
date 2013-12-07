Clip      = require "./clip"
paper     = require "./paper"
browser   = require "./browser"
translate = require "./translate"
adapters  = require "./node/adapters"
fs = require "fs"


require("./node")

module.exports = browser

# node
module.exports.compile    = translate.compile
module.exports.translator = translate

# express
module.exports.adapters = adapters

# register so that strings are compiled
paper.template.compiler = translate


require.extensions[".pc"] = (module, filename) ->
  module.exports = translate.compile(fs.readFileSync(filename, "utf8"))