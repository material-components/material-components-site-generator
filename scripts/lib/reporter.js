const chalk = require('chalk');


class Reporter {
  constructor() {
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
      colors: true
    }))
  }

  complete() {
    this.logLine_(chalk.green('Done!'));
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
