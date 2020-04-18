module.exports = {
  browserContext: 'incognito',
  reporters: ['default', './test/utils/github-reporter.js'],
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOWMO ? process.env.SLOWMO : 0,
    ignoreHTTPSErrors: true
  }
};
