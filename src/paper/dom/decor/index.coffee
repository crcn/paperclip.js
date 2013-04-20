TextDecorator    = require "./text"
ElementDecorator = require "./element"

class DecoratorFactory

  ###
  ###

  constructor: () ->


  ###
  ###

  attach: (data, element) ->
    if element.nodeName is "#text"
      if TextDecorator.test element
        DecoratorClass = TextDecorator
    else
      if ElementDecorator.test element
        DecoratorClass = ElementDecorator

    return if not DecoratorClass

    element._paperclipDecorator = new DecoratorClass data, element


module.exports = DecoratorFactory