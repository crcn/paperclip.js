templateParser = require "./template/parser"

exports.parse = parse = (content, options = {}) ->    
  content = templateParser.parse content
  String content


scripts = {}

exports.compile = (nameOrContent) ->
  module = { exports: { } }

  if scripts[nameOrContent]
    return scripts[nameOrContent]

  try
    if typeof $ isnt "undefined"
      content = $("script[data-template-name='#{nameOrContent}']").html()
  catch e

  unless content
    content = nameOrContent


  eval parse content
  scripts[nameOrContent] = module.exports


if typeof window?.paperclip isnt "undefined"
  window.paperclip.compile = exports.compile
  window.paperclip.script  = exports.script
  window.paperclip.template.compiler = exports