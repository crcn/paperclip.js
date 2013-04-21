TextDecorator    = require "./text"
ElementDecorator = require "./element"
BindDecorator    = require "./bind"

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
      else if BindDecorator.test element
        DecoratorClass = BindDecorator

    return if not DecoratorClass

    element._paperclipDecorator = new DecoratorClass data, element


module.exports = DecoratorFactory