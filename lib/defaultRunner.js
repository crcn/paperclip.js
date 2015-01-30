var frameRunner = require("frame-runner");
module.exports = frameRunner(
  process.browser ? void 0 : process.env.PC_DEBUG ? process.nextTick : void 0
);