templateParser = require "./template/parser"
formatter      = require "./template/formatter"

exports.parse = parse = (content, options = {}) ->    
  content = templateParser.parse content
  formatter.format content

exports.compile = (content) ->
  module = { exports: { } }
  eval parse content
  module.exports


if typeof window?.paperclip isnt "undefined"
  window.paperclip.compile = exports.comple