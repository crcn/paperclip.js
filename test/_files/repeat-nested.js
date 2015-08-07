module.exports = {
  items: Array.apply(void 0, new Array(5)).map(function(v, i) {
    return Array.apply(void 0, new Array(i)).map(function(v, j) {
      return i * 10 + j;
    })
  })
};
