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

    # dirty as shit, but gets rid of blank .html('')
    ast = jsp.parse String(source).replace(/\.push\(\'\'\)/g,"").replace(/\.html\(\'\'\)/g,"")
    source = pro.gen_code ast, { beautify: true }



module.exports = new Formatter()