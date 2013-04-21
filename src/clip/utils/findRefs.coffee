module.exports = (expr, refs = []) ->
  
  if expr._type is "refPath"
    refs.push expr


  for child in expr._children
    module.exports child, refs

  refs


