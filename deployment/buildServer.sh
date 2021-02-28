#!/bin/bash

# cd to Backend root
cd ~/BrettSpiel_Backend

# update local repo
echo updating local repo
git checkout master
git fetch --tags
tag=$(git describe --tags `git rev-list --tags --max-count=1`)
echo latest tag is $tag
git checkout $tag

# update npm dependencies
echo updating npm dependencies
npm install

echo Done


