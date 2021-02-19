#!/bin/bash

# kill old instances
lsof -t -i:41920 | ifne kill $(lsof -t -i:41920)
echo Killed old instances

