Context    = require "./context"
Html       = require "./nodes/html"
pilot      = require "pilot-block"       
asyngleton = require "asyngleton"

class Paper

  ###
  ###

  constructor: (@factory) ->
    @node = @factory.call @

  ###
  ###

  load: asyngleton (context, callback) -> 
    @node.load context, callback

  ###
  ###

  attach: (element, context, callback = (() ->)) -> 
    @load context, (err, context) =>
      return callback(err) if err?


      # set the inner html of the target
      element.innerHTML = context.buffer.join("")


      # scan the element for sections
      pilot.update element


      # attach the sections to their rightful binding
      for binding in context.bindings
        binding.bind(pilot.section(binding.id))

      callback null, context

  ###
  ###

  create: () -> new Html()




module.exports = (fn) -> new Paper(fn)
module.exports.Context = Context

