templateParser = require "./template/parser"

exports.parse = parse = (content, options = {}) ->    
  content = templateParser.parse content
  content

exports.compile = (content) ->
  module = { exports: { } }
  eval parse content
  module.exports


if typeof window?.paperclip isnt "undefined"
  window.paperclip.compile = exports.compile