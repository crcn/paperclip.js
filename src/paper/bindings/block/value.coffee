ent = require "ent"

class ValueDecor extends require("./base")
  


  ###
  ###

  _onChange: (value) ->
  
    unless value?
      value = ""


    @section.replaceChildNodes @nodeFactory.createTextNode ent.encode String value




module.exports = ValueDecor