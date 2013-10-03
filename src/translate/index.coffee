templateParser = require "./template/parser"

exports.parse = parse = (content, options = {}) ->    
  content = templateParser.parse content
  String content

exports.compile = (content) ->
  module = { exports: { } }
  eval parse content
  module.exports


exports.script = (name) ->
  exports.compile $("script[data-template-name='#{name}']").html()

if typeof window?.paperclip isnt "undefined"
  window.paperclip.compile = exports.compile
  window.paperclip.script  = exports.script