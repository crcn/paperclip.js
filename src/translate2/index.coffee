templateParser = require "./template/parser"
formatter      = require "./template/formatter"

exports.parse = (content, options = {}) ->    
  content = templateParser.parse content
  formatter.format content