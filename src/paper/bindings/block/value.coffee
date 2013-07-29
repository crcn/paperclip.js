escapeHTML = require "../../utils/escapeHTML"

class ValueDecor extends require("./base")

  ###
  ###

  _onChange: (value) ->
  
    unless value?
      value = ""

    @section.replaceChildNodes @nodeFactory.createTextNode String value


module.exports = ValueDecor