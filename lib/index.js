module.exports = {

  /**
   * web component base class
   */

  Component : require("./components/base"),

  /**
   * template factory
   */

  template  : require("./template"),

  /**
   */

  components : {
    repeat : require("./components/repeat"),
    stack  : require("./components/stack")
  }
}