browser = require "../../browser"
fs = require "fs"



cache = {}

compile = (path) ->

  content = fs.readFileSync path, "utf8"
  tpl = browser.template content

  bindable = new browser.bindable.Object()
  loader = tpl.bind bindable

  (data) -> 
    bindable.reset data
    loader.toString()
  

module.exports = (path, options, next) ->
  tpl = cache[path] or (cache[path] = compile(path))
  next null, tpl(options)