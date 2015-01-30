var extend = require("xtend");
// Karma configuration
// Generated on Fri Jan 30 2015 11:49:56 GMT-0800 (PST)

module.exports = function(config) {

  // Example set of browsers to run on Sauce Labs
  // Check out https://saucelabs.com/platforms for all browser/platform combos
  var slLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '35'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '35'
    },/*
    sl_ios_safari: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.9',
      version: '7.1'
    },*/
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    }
  };

  var bsLaunchers = {

    bs_ffox_35: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '35.0',
      os: 'OS X',
      os_version: 'Mountain Lion'
    },
    bs_chrome_30: {
      base: 'BrowserStack',
      browser: 'chrome',
      browser_version: '30.0',
      os: 'OS X',
      os_version: 'Mountain Lion'
    },
    bs_safari: {
      base: 'BrowserStack',
      browser: 'safari',
      os: 'OS X',
      os_version: 'Yosemite'
    },
    /*bs_ie_9: {
      base: 'BrowserStack',
      browser: 'ie',
      browser_version: '9.0',
      os: 'Windows',
      os_version: '7'
    },*/
    bs_ie_10: {
      base: 'BrowserStack',
      browser: 'ie',
      browser_version: '10.0',
      os: 'Windows',
      os_version: '8'
    },
    bs_ie_11: {
      base: 'BrowserStack',
      browser: 'ie',
      browser_version: '11.0',
      os: 'Windows',
      os_version: '8.1'
    }
  };


  var hasBrowserStack = !!process.env.BS_USERNAME;
  var hasSauceLabs = !!process.env.SAUCE_USERNAME;

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha'],


    // list of files / patterns to load in the browser
    files: [
      'test/libs/*',
      'test/*/**-test.js'
    ],


    // list of files to exclude
    exclude: [
      'init-test.js',
      '0-init',
      '*init*',
      './test/0-init/*'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    
    preprocessors: {
      'test/libs/*': [ 'browserify' ],
      'test/**/**.js': [ 'browserify' ]
    },


    // global config of your BrowserStack account
    browserStack: {
      username: process.env.BS_USERNAME,
      accessKey: process.env.BS_ACCESS_KEY
    },


    browserify: {
      debug: true,
      transform: [ ]
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: 
      hasBrowserStack ? ['dots'] : 
      hasSauceLabs ? ['dots','saucelabs'] : 
      ['dots'],


    sauceLabs: {
        testName: 'Paperclip.js unit test'
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    customLaunchers: extend(slLaunchers, bsLaunchers),


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: 
    hasBrowserStack ? Object.keys(bsLaunchers) :
    hasSauceLabs    ? Object.keys(slLaunchers) : 
    ['Chrome','Firefox','Safari'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    client: {
      captureConsole: true,
      mocha: {
        bail: true
      }
    }
  });
};
