class Handler
  constructor: (@script, @clip, @element) ->
  init: () ->
    if @watch isnt false
      @script.watch()

  
module.exports = Handler