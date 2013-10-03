uglify = require "uglify-js"
jsp    = uglify.parser
pro    = uglify.uglify

###
  Beautifies javascript
###

class Formatter

  ###
  ###

  format: (source) ->

    # dirty as shit, but gets rid of blank .text('')
    ast = jsp.parse String(source)
    source = pro.gen_code ast, { beautify: true }



module.exports = new Formatter()