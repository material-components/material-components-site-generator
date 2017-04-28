const chalk = require('chalk');


class Reporter {
  constructor() {
    this.startTimeMs_ = Date.now();
    this.inStep_ = false;
    this.loggedInStep_ = false;
  }

  step(stepLabel, runStep, { noCheck } = { noCheck: false }) {
    this.log_(chalk.cyan(stepLabel + '...') + (noCheck ? '\n' : ''));
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

  fileWarning(filePath, warningMessage) {
    if (this.inStep_) {
      this.logLine_();
    }

    this.logLine_(`  Warning: ${ chalk.yellow(filePath) }`);
    this.logLine_(`  ${ warningMessage }`);
  }

  linkWarning(href, filePath, warningMessage) {
    if (this.inStep_) {
      this.logLine_();
    }

    this.logLine_(`  Warning: ${ chalk.yellow(href) } in ${ chalk.yellow(filePath) }`);
    this.logLine_(`  ${ warningMessage }`);
  }

  fileDestinationConflict(destPath, srcPath1, srcPath2) {
    console.log('filePathConflict', arguments);

    if (this.inStep_) {
      this.logLine_();
    }

    this.logLine_(chalk.bgRed('Error:'));
    this.logLine_(`${ chalk.yellow(srcPath1) } and \n${ chalk.yellow(srcPath2) } both attempting to write to ${ chalk.yellow(destPath) }`);
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
    this.logLine_(`File changed: ${ chalk.yellow(filePath) }`);
  }

  complete(distPath) {
    const durationInSeconds = (Date.now() - this.startTimeMs_) / 1000;
    this.logLine_(`Site written to ${ chalk.yellow(distPath) }`);
    this.logLine_(chalk.green(`✨  Done in ${ durationInSeconds.toFixed(2) }s.`));
  }

  log_(msg) {
    process.stderr.write(msg);
    if (this.inStep_) {
      this.loggedInStep_ = true;
    }
  }

  logLine_(msg) {
    this.log_(`${ msg || '' }\n`);
  }
}


module.exports = new Reporter();
