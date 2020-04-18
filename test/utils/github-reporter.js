const crypto = require('crypto');
const fetch = require('node-fetch');
const fs = require('fs');

const DIFF_OUTPUT = './test/integration/__image_snapshots__/__diff_output__/';

class GitHubReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }
  async onTestResult(test, testResult) {
    if (testResult.numFailingTests && testResult.failureMessage.match(/different from snapshot/)) {
      if (!process.env.GITHUB_EVENT_PATH) return;
      // eslint-disable-next-line global-require
      const event = require(process.env.GITHUB_EVENT_PATH)
      let pullNumber;
      if (!event.pull_request) {
        return;
      }
      pullNumber = event.pull_request.number

      console.info(`visual integration tests failed for PR ${pullNumber}`)
      console.info('------------')
      const files = fs.readdirSync(DIFF_OUTPUT);
      const body = {
        repository: process.env.GITHUB_REPOSITORY,
        run_id: process.env.GITHUB_RUN_ID,
        action_log_file: process.env.ACTION_LOG_FILE,
        installation_id: process.env.IMAGE_DIFF_INSTALLATION,
        images: [],
        pull_number: pullNumber
      };
      for (const file of files) {
        const content = fs.readFileSync(`${DIFF_OUTPUT}/${file}`).toString('base64');
        const sha = getSha256Hash(content);
        console.info(`uploading screenshot ${sha}`)
        body.images.push({
          sha,
          name: file,
          content
        });
      }
      await fetch(process.env.SCREENSHOT_UPLOAD_URL, {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.info('------------')
  }
}

function getSha256Hash(body) {
  return crypto.createHash('sha256')
    .update(body)
    .digest('hex');
}

module.exports = GitHubReporter;
