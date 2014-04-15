module.exports = {
  trim: function(str) {
    return String(str).replace(/^\s+|\s+$/g, "");
  },
  browser: require("./browser").browser,
  trimEl: function(str) {
    return String(str).replace(/:\s*/g,":").replace(/;\s*/g,";").replace(' style=""',"")
  }
}