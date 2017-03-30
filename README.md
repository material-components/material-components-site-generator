# mdc-site generation

### Prerequisites

- Ruby
  - Using OS X's system Ruby is not recommended, because requires writing to
    system folders. [rbenv](https://github.com/rbenv/rbenv) is a better option.
    The required Ruby version is indicated in the Gemfile.
- Xcode Command Line Tools (if on a mac)
- Homebrew
- Node.js v7+

### Installation

```sh
$ gem install bundler
$ bundle i
$ brew update
$ brew install yarn
```

### Building the Site

```sh
$ scripts/build path/to/mdc/repo
```
