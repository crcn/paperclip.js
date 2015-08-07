module.exports = {
  items: Array.apply(void 0, new Array(5)).map(function(a, v) {
    return {
      isEven: !(v % 2),
      value: v
    }
  })
}
