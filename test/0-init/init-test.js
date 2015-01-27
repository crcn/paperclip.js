var jsdom  = require("jsdom"),
nofactor   = require("nofactor");

before(function (next) {

  jsdom.env("<html><head></head><body></body></html>", [ __dirname + "/jquery.js"], function(err, window) {

    // set the document to global so that nofactor has access to it
    global.document = window.document;
    global.window   = window;

    // make sure this is accessible in the application
    global.$ = window.$;

    next();
  });
});