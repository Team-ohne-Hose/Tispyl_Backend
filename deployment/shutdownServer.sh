#!/bin/bash

# kill old instances
/usr/sbin/lsof -t -i:41920 | ifne kill $(/usr/sbin/lsof -t -i:41920)
echo Killed old instances

