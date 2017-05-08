# Material Components Docsite Generator

The docsite generator transforms directory hierarchies containing specially
annotationed Markdown into
[https://material.io/components](https://material.io/components).

## Prerequisites

- Ruby
  - Using OS X's system Ruby is not recommended, because requires writing to
    system folders. [rbenv](https://github.com/rbenv/rbenv) is a better option.
    The required Ruby version is indicated in the Gemfile.
- Xcode Command Line Tools (if on a mac)
- Homebrew
- Node.js v7+

## Installation

```sh
gem install bundler
bundle install
brew update
brew install yarn
yarn install
```

## Building the Site

The build script works with one or more component/documentation repos as input.
A documentation repo must have an .mdc-docsite.yml file in its root, and it should
define a [basepath](#basepath) variable at the very least.

Running

```sh
$ scripts/build path/to/mdc/repo_1 [path/to/mdc/repo_2 ...]
```

will output a static site in the `dist/` directory. In order to test the site,
run a local web server with the `dist/` directory as its root.

### Change Watching

During development, it can be useful to have site builds triggered by changes to
files. I've included very basic file watching functionality (not everything is
watched) that can be enabled with the `--watch` option.

### Build Environments

By default, `scripts/build` will build the site using a development
configuration, which outputs source maps and tidied HTML.

Production builds should have `BUILD_ENV=production` precede the command to
build optimized code.

### Production site build

An incredibly slow and naive script has been written that performs a complete
build of the site. It will clone the four repos into a folder called `docs-src`,
and write the final output to `dist/`.

```sh
scripts/prod_build
```
