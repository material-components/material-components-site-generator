/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { PLATFORM_CONFIG_PATH } = require('./project-paths');
const fs = require('fs');
const meow = require('meow');
const path = require('path');


const cli = meow(`
  Usage
    $ scripts/build [--apidocs/-a] [--watch/-w] <path/to/mdc/repo> [<path/to/another/repo>]*

  Options
    --watch, -w   Watch filesystem for changes.
    --apidocs, -a Build API documentation. (Increases build time)
`, {
  defaults: {
    watch: false,
    apidocs: false,
  },
  boolean: ['watch', 'apidocs'],
  alias: {
    'w': 'watch',
    'a': 'apidocs',
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
    printErrorAndQuit(`Path argument must point to a directory that exists, and contains ${PLATFORM_CONFIG_PATH} site configuration.\npath: ${invalidPath}`);
  }

  // Mixin the build environment
  cli.buildEnvironment = process.env.BUILD_ENV || 'development';

  return cli;
};


function isValidSitePath(sitePath) {
  return fs.existsSync(sitePath) &&
         fs.lstatSync(sitePath).isDirectory() &&
         fs.existsSync(path.join(sitePath, PLATFORM_CONFIG_PATH));
}


function printErrorAndQuit(errorMsg) {
  console.error(errorMsg);
  console.error(cli.help);
  process.exit(1);
}
