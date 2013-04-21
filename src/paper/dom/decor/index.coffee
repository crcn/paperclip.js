TextDecorator    = require "./text"
ElementDecorator = require "./element"
BindDecorator    = require "./bind"

class DecoratorFactory

  ###
  ###

  attach: (data, element) ->
    classes = []

    if element.nodeName is "#text"
      if TextDecorator.test element
        classes.push TextDecorator
    else
      if ElementDecorator.test element
        classes.push ElementDecorator
      else if BindDecorator.test element
        classes.push BindDecorator

    return if not classes.length


    element._pcDecorators = classes.map (clazz) ->
      new clazz data, element


module.exports = DecoratorFactory