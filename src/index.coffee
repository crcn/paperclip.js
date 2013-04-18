tokenizer = require "./tokenizer"
tokenizer.source("hello   '\"world\\'s\"'{|;,@}.():$")
while token = tokenizer.nextToken()
  console.log token