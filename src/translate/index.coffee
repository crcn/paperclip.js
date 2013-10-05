templateParser = require "./template/parser"

exports.parse = parse = (content, options = {}) ->    
  content = templateParser.parse content
  String content

exports.compile = (content) ->
  module = { exports: { } }
  eval parse content
  module.exports

scripts = {}

exports.script = (name) ->

  if scripts[name] 
    return scripts[name]

  content = $("script[data-template-name='#{name}']").html()

  return unless content

  scripts[name] = exports.compile(content)

if typeof window?.paperclip isnt "undefined"
  window.paperclip.compile = exports.compile
  window.paperclip.script  = exports.script
  window.paperclip.template.compiler = exports