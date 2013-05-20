watch    = require "watch"
walkr     = require "walkr"
path      = require "path"
_         = require "underscore"
parser    = require "../translate/template/parser"
formatter = require "../translate/template/formatter"

###
 Compiles node.js files
###

class Build

  ###
  ###

  constructor: () ->

  ###
  ###

  start: (@options = {}) ->


    _.defaults options, {
      extension: "pc"
    }


    @_pretty = options.format
    @_ext    = options.extension
    @_match  = new RegExp "\\.#{@_ext}$"

    @parse options


  ###
  ###

  parse: (options) ->

    match = @_match

    walkr(@_input = @_fixInput(options.input), @_output = @_fixInput(options.output)).
    filterFile(@_parseFile).
    start () ->

    return if not options.watch
    @_watch()

  ###
  ###

  _fixInput: (input) -> path.resolve input.replace(/^\./, process.cwd()).replace(/^~/, process.env.HOME)

  ###
  ###

  _watch: () ->
    watch.createMonitor @_input, (monitor) =>
      monitor.on "changed", (file) =>
        @_parseFile file
      monitor.on "created", (file) =>  
        @_parseFile file
      monitor.on "removed", (file) =>
        fs.unlink output = @_destFile file
        console.log "rm", output

  ###
  ###

  _parseFile: (source, next = (() ->)) => 
    return next() if not source.match(@_match)
    destination = @_destFile source
    fs.readFile source, "utf8", (err, content) =>
      return next(err) if err?
      tpl = parser.parse(content)
      if @_pretty
        tpl = formatter.format(tpl)
      fs.writeFile destination, tpl, "utf8", next
      console.log source, "->", destination


  ###
  ###

  _destFile: (source) => source.replace(@_input, @_output).replace(@_match, ".js")


module.exports = Build
