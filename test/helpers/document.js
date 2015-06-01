if (process.browser) return;

var jsdom = require("jsdom").jsdom;

global.document = jsdom("<html><head></head><body></body></html>");
