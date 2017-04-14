const { PLATFORM_CONFIG_PATH } = require('./project-paths');
const fs = require('fs');
const meow = require('meow');
const path = require('path');


const cli = meow(`
  Usage
    $ scripts/build [--watch/-w] <path/to/mdc/repo> [<path/to/another/repo>]*

  Options
    --watch, -w  Watch filesystem for changes.
`, {
  defaults: {
    watch: false,
  },
  boolean: ['watch'],
  alias: {
    'w': 'watch',
  },
});


module.exports.initCli = () => {
  // Validate input
  if (cli.input.length == 0) {
    printErrorAndQuit('Missing path to components repo.');
  }

  // Map all site paths to absolute
  cli.input = cli.input.map((sitePath) => path.resolve(sitePath));

  // Ensure that all site paths are valid directories containing metadata.
  const invalidPath = cli.input.find((sitePath) => !isValidSitePath(sitePath));
  if (invalidPath) {
    printErrorAndQuit(`Path argument must point to a directory containing ${PLATFORM_CONFIG_PATH} site configuration.\npath: ${invalidPath}`);
  }

  return cli;
};


function isValidSitePath(sitePath) {
  return fs.lstatSync(sitePath).isDirectory() &&
         fs.existsSync(path.join(sitePath, PLATFORM_CONFIG_PATH));
}


function printErrorAndQuit(errorMsg) {
  console.error(errorMsg);
  console.error(cli.help);
  process.exit(1);
}
