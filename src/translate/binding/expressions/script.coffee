base = require "../../base/expression"
_    = require "underscore"

findRefs = (expr, refs = []) ->

  return [] unless expr
    
  if expr._type is "refPath"
    refs.push expr

  for child in expr._children
    findRefs child, refs

  refs


class ActionExpression extends base.Expression
  
  ###
  ###

  _type: "script"

  ###
  ###

  constructor: (@name, @options) ->
    super()

  ###
  ###

  toString: () -> 

    refs      = _.uniq findRefs(@options).filter((ref) ->
      ref.unbound isnt true
    ).map((ref) -> ref.toArrayString() )
    refBuffer = ["[", refs.join(","), "]"].join("")

    "{ fn: function(){ return #{if @options then @options.toString() else 'true'}; }, refs: #{refBuffer} }"


module.exports = ActionExpression