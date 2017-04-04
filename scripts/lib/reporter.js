const chalk = require('chalk');


class Reporter {
  constructor() {
    this.startTimeMs_ = Date.now();
    this.inStep_ = false;
    this.loggedInStep_ = false;
  }

  step(stepLabel, runStep, { noCheck } = { noCheck: false }) {
    this.log_(chalk.cyan(stepLabel) + (noCheck ? '\n' : ''));
    this.inStep_ = true;

    try {
      const result = runStep();
      this.logLine_(this.loggedInStep_ || noCheck ? null : chalk.green('✓'));
      return result;
    } catch (e) {
      throw e;
    } finally {
      this.loggedInStep_ = false;
      this.inStep_ = false;
    }
  }

  fatal(err) {
    this.logLine_(chalk.red('Something went wrong'));
    this.logLine_(err.toString());
  }

  webpackStats(stats) {
    this.logLine_(stats.toString({
      chunks: false,
      colors: true,
      hash: false,
    }) + '\n');
  }

  fileChanged(filePath) {
    this.logLine_(`File changed: ${chalk.yellow(filePath)}`);
  }

  complete() {
    const durationInSeconds = (Date.now() - this.startTimeMs_) / 1000;
    this.logLine_(chalk.green(`✨  Done in ${durationInSeconds.toFixed(2)}s.`));
  }

  log_(msg) {
    process.stderr.write(msg);
    if (this.inStep_) {
      this.loggedInStep_ = true;
    }
  }

  logLine_(msg) {
    this.log_(`${msg || ''}\n`);
  }
}


module.exports = new Reporter();
