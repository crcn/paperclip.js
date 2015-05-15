module.exports = function(to, from) {

  from.on("change", function(key, value) {
    to[key] = value;
  });

  return from;
};
