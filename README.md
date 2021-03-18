# Material Components Docsite Generator (Deprecated)

The docsite generator transforms Markdown files found in material-component repos, styles them,
moves them around, rewrites links to match, and spits out
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
A documentation repo must have an `.mdc-docsite.yml` file in its root, and it should
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

### Production site build (single platform)

If you're looking to build the site for a single platform, run the following:

```sh
BUILD_ENV=production scripts/build --apidocs /path/to/mdc/repo/root
```

### Production site build (all platforms)

An incredibly slow and naive script has been written that performs a complete
build of the site. It will clone the four repos into a folder called `docs-src`,
and write the final output to `dist/`.

```sh
scripts/prod_build
```

## Writing Documentation

The following describes how to write documentation for the
[material.io/components](https://material.io/components) site.

### Adding Configuration Metadata

Only markdown files containing [Front Matter](https://jekyllrb.com/docs/frontmatter/)
configuration metadata will be transformed into HTML by the site generation tool.

The configuration *must appear at the top of the file*, and be delimited with `<!--docs:` and
`-->`. Example:

```markdown
<!--docs:
title: "Page Title"
-->
Plain old Markdown
```

##### Sample Config – Component

Below is a sample metadata block taken from a component's README.md. Take notice of the casing and
pluralization used for each field. [The fields are described](#configuration-fields) in more detail
below.

```
<!--docs:
title: "Buttons" # name of component (not class), plural, title case
excerpt: "Material Design-styled buttons."
layout: detail # do not change
section: components # do not change
icon_id: text_field # described below
path: /catalog/text-fields/ # child of /catalog/, kebab-case, plural
-->
```

##### Sample Config – General Documentation (non-component)

```
<!--docs:
title: "How to Write Components"
excerpt: "A tutorial on how to write components."
layout: landing # do not change
section: docs # do not change
path: /docs/how-to-write-components/ # child of /docs/, kebab-case
-->
```

#### Configuration Fields

##### title

`title` is used as link text for the page in side navigation, as well as to populate the page's
`<title>` element.

For component pages, this should be the name of the component (not the class), title-cased, and
pluralized (where appropriate).

##### excerpt

`excerpt` is a short (one sentence) description of the page.

On component pages, it is used as the little snippet of text diplayed in the
[component listing](https://material.io/components/web/catalog/).

It is used on all pages to populate `<meta name="description">` elements.

##### section

Used to generate navigation. Should be `components` for component pages or `docs` otherwise.

##### layout

Determine the Jekyll layout to use. The available layouts can be found in
[this directory](https://github.com/material-components/material-components-site-generator/tree/master/jekyll-site-src/_layouts).

Component pages should use the `detail` layout. Documentation pages should use the `landing` layout.

##### icon_id

This is only applicable to files with [`section: component`](#section).

The ID of the icon associated with a component's readme. This is displayed on component and
[component listing](https://material.io/components/web/catalog/) pages.

An icon ID is the name of an
[SVG in this directory](https://github.com/material-components/material-components-site-generator/tree/master/jekyll-site-src/images/component_icons),
without its extension. For example, to use `bottom_navigation.svg`, your metadata should read
`icon_id: bottom_navigation`.

##### path

The destination path for the document's generated HTML.

Ending the path in a `/` will write out an `index.html`.

All links to other Markdown/files will be automatically rewritten to reflect their
paths in the generated site.

Confused? Here's the rule: Write all your links so they'll work on GitHub. The site generator 
will do the rest.

##### api_doc_root

`true` if the site's documentation generator should be invoked on this directory. Currently this is
only used on the iOS platform.

If omitted, this field defaults to `false`.

##### virtual_source_path

GitHub markdown files will sometimes link to a directory in the source tree that does not have an
associated README, or its README is inappropriate for inclusion on the documentation site.
`virtual_source_path` exists so that you can tell a the site generator to treat a file as if it
exists somewhere in the source repo that it doesn't, so that other files can link to it in the generated site.
