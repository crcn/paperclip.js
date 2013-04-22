base = require "../../base/expression"
_    = require "underscore"

findRefs = (expr, refs = []) ->
  
  if expr._type is "refPath"
    refs.push expr


  for child in expr._children?
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
    refs      = _.uniq findRefs(@options).map((ref) -> "'" + (ref.toPathString()) + "'" )
    refBuffer = ["[", refs.join(","), "]"].join("")

    "{ fn: function(){ return #{@options.toString()} }, refs: #{refBuffer} }"


module.exports = ActionExpression