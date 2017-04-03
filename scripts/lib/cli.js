const fs = require('fs');
const meow = require('meow');


module.exports.initCli = () => {
  const cli = meow(`
    Usage
      $ scripts/build [--watch/-w] <path/to/mdc/repo>

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

  // Validate input
  if (cli.input.length == 0) {
    console.error('Missing path to components repo.');
    console.error(cli.help);
    process.exit(1);
  }

  const docsRepoPath = cli.input[0];
  if (!fs.lstatSync(docsRepoPath).isDirectory()) {
    console.error('Path argument must point to a directory.');
    console.error(cli.help);
    process.exit(1);
  }

  return cli;
};
