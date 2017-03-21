# mdc-site generation

### Prerequisites

- Ruby
  - Using OS X's system Ruby is not recommended, because requires writing to
    system folders. [rbenv](https://github.com/rbenv/rbenv) is a better option.
    The required Ruby version is indicated in the Gemfile.
- Xcode Command Line Tools (if on a mac)
- node v7+

### Installation

```sh
gem install bundler
bundle i
npm install -g yarn
yarn install
```

### Building JavaScript for Development

The following will start a watch that builds the JavaScript whenever it changes:
```sh
$ npm run dev
```

### Building JavaScript for Production
```sh
$ npm run build
```
