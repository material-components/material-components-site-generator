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
# Make sure jazzy is installed
JAZZY_VERSION=`BUNDLE_GEMFILE=$GEMFILE_PATH bundle exec jazzy --version`
if [[ $? != 0 ]]; then
  echo "Cannot find jazzy. To install try:"
  echo "[sudo] bundle install"
  exit 1
fi

# Switching to the root folder of mdc
cd "$SITE_DIR/../.."
ROOT_DIR="$(pwd)"

BuildComponent () {
  folder=$1
  component=$(basename $folder)
  echo "Generating api reference for $component..."

  cd "$folder"
  jazzy_output="$SITE_DIR/../jekyll-site-src/components/$component/apidocs"

  # Clear the exsiting folder
  if [ -d $jazzy_output ]; then
    rm -r $jazzy_output
  fi

  # Generate new api doc
  BUNDLE_GEMFILE=$GEMFILE_PATH bundle exec jazzy \
    --output "$jazzy_output" \
    --theme "$SITE_DIR/theme" \
    --module $component \
    --umbrella-header src/Material$component.h \
    --objc \
    --sdk iphonesimulator
  # Copy api doc assets if there is any
  if [ -d $folder/docs/assets ]; then
    cp -R "$folder/docs/assets/" "$jazzy_output/assets/"
  fi

  # Adjust path to assets in generated files
  sed -i '' 's/docs\///g' $jazzy_output/*.html
  rm -r $jazzy_output/index.html $jazzy_output/docsets
  cd $ROOT_DIR
}

# Build target component(s)
if [ $# -gt 0 ]; then
  directory="$ROOT_DIR"/components/$*
  BuildComponent $directory
else
  # Enumerate all documentable folders
  for directory in "$ROOT_DIR"/components/*/README.md; do
    BuildComponent $(dirname $directory)
  done
fi
