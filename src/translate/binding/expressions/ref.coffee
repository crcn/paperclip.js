
class RefExpression

  ###
  ###

  _type: "ref"

  ###
  ###

  constructor: (name, @unbound) ->
    @_children = []
    if name.substr(0, 1) is "@"
      @self = true
      @name = name.substr(1)
    else
      @name = name

  ###
  ###

  toString: () -> @name
  

module.exports = RefExpression