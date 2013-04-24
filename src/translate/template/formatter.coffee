uglify = require "uglify-js"
jsp    = uglify.parser
pro    = uglify.uglify

class Formatter

  ###
  ###

  format: (source) ->
    ast = jsp.parse String source
    pro.gen_code ast, { beautify: true }



module.exports = new Formatter()