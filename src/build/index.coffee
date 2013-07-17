watch_r    = require "watch_r"
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
    @_input = @_fixInput(options.input)
    if options.output
      @_output = @_fixInput(options.output)

    if options.watch
      @_watch()
    else
      walkr(@_input).
      filterFile((file, next) =>
        @_parseFile file.source, next
      ).
      start () ->


  ###
  ###

  _fixInput: (input) -> path.resolve input.replace(/^\./, process.cwd()).replace(/^~/, process.env.HOME)

  ###
  ###

  _watch: () ->
    watch_r @_input, (err, monitor) =>
      monitor.on "change", (target) =>
        @_parseFile target.path
      monitor.on "file", (target) => 
        @_parseFile target.path
      monitor.on "remove", (target) =>
        output = @_destFile target.path

        if output
          fs.unlink output

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

      if destination
        fs.writeFile destination, tpl, "utf8", next
        console.log source, "->", destination
      else
        console.log String tpl


  ###
  ###

  _destFile: (source) => 
    return undefined unless @_output
    source.replace(@_input, @_output).replace(@_match, ".#{@_ext}.js")


module.exports = Build
