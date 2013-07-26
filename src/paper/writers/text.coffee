class TextWriter 
  
  ###
  ###

  constructor: (@pape, @nodeFactory) ->

  ###
  ###

  write: (text) =>
    @nodeFactory.createTextNode text


module.exports = TextWriter