#!/bin/bash
#
# Copyright 2015-present Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

SITE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GEMFILE_PATH=$SITE_DIR/../Gemfile

# Check the prerequisites
# Make sure jekyll is installed
JEKYLL_VERSION=`BUNDLE_GEMFILE=$GEMFILE_PATH bundle exec jekyll --version`
if [[ $? != 0 ]]; then
  echo "Cannot find jekyll. To install try:"
  echo "[sudo] bundle install"
  exit 1
fi

# Switching to the root folder of mdc
cd "$SITE_DIR/../.."
ROOT_DIR="$(pwd)"


## COPY ALL SOURCE MARKDOWN


## Copy each folder containing documentation.
FOLDERS=("components" "contributing" "howto")
TARGET=$SITE_DIR

## The home page is special.
cp $ROOT_DIR/site-index.md $TARGET/index.md

for i in ${FOLDERS[@]}; do
  ## Include all folders (for recursion), Markdown files, and .jekyll_prefix.yaml files but nothing else.
  rsync -r --include='*/' --include='*.md' --include='.jekyll_prefix.yaml' --exclude='*' --prune-empty-dirs "${ROOT_DIR}/${i}" "${TARGET}"

  ## Rename the README.md files to index.md in preparation to become index.html.
  for j in $(find "${TARGET}/${i}" -name README.md); do

    ## Prepend all README.md files with associated .jekyll_prefix.yaml files if available then remove
    ## .jekyll_prefix.yaml files
    README_DIR=$(dirname "$j")
    YAML_FILE=$(find "$README_DIR" -maxdepth 1 -name .jekyll_prefix.yaml)
    if [ -e "$YAML_FILE" ]; then
      cat "$YAML_FILE" "$j" > "${README_DIR}/README.tmp"
      mv "${README_DIR}/README.tmp" "$j"
      rm $YAML_FILE
    fi
    NEW_NAME=$(echo ${j} | sed -e s/README/index/)
    mv "${j}" "${NEW_NAME}"
  done

  ## Copy extra docs/assets in.
  for k in $(find "${i}"/* -type d -maxdepth 0); do
    if [ -d "${k}/docs" ]; then
      rsync -r "${k}/docs" "${TARGET}/${k}"
    else
      if [ -d "${TARGET}/${k}/docs" ]; then
        rm -rf "${TARGET}/${k}/docs"
      fi
    fi
  done
done


# UNCOMMENT LIQUID TAGS FROM MARKDOWN

#grep -rl '<!--{.*}-->' ./ | xargs sed -i '' 's/<!--{\(.*\)}-->/{\1}/g'
GREP_LIQUID_TAGS="grep -rl --include='*\.md' '<!--[{<].*[>}]-->'"
#SED_LIQUID_TAGS="sed -i '' 's/<!--\([{<]\)\([^>]*\)\([>}]\)-->/\1\2\3/g'"
PERLSUB_LIQUID_TAGS="perl -pi -e 's/<!--([{<])(.*?)([>}])-->/\1\2\3/g'"
eval "$PERLSUB_LIQUID_TAGS $SITE_DIR/jekyll-site-src/index.md"
eval "$GREP_LIQUID_TAGS $SITE_DIR/jekyll-site-src/howto | xargs $PERLSUB_LIQUID_TAGS"
eval "$GREP_LIQUID_TAGS $SITE_DIR/jekyll-site-src/contributing | xargs $PERLSUB_LIQUID_TAGS"
eval "$GREP_LIQUID_TAGS $SITE_DIR/jekyll-site-src/components | xargs $PERLSUB_LIQUID_TAGS"


# Build/Preview
jekyll_output=$SITE_DIR/site-build
# Clear the exsiting folder
if [ -d $jekyll_output ]; then
  rm -r $jekyll_output/*
fi

# Determine build mode: preview/build, deploy env
preview=true
config="_config.yml"
while [ $# -gt 0 ]; do
  case $1 in
    "--no-preview")
      preview=false
      shift
    ;;
    "-e" | "--for-env")
      if [[ $2 == 'production' ]]; then
        config="_config.yml,_mdc_ios_preview_config.yml"
      fi
      shift 2
    ;;
    *)
      shift 1
    ;;
  esac
done

# Build site
cd $SITE_DIR
if $preview; then
  BUNDLE_GEMFILE=$GEMFILE_PATH bundle exec jekyll serve --destination $jekyll_output --config $config
else
  BUNDLE_GEMFILE=$GEMFILE_PATH bundle exec jekyll build --destination $jekyll_output --config $config
fi
