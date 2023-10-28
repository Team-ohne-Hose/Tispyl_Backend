#!/bin/bash

# kill old instances
/usr/sbin/lsof -t -i:41920 | ifne kill $(/usr/sbin/lsof -t -i:41920)
echo Killed old instances

# cd into Backend root and run Production server
cd ~/BrettSpiel_Backend

# let action run into timeout instead of direcly detaching
# directly detaching with & didnt work
nohup npm run start:prod 1>/dev/null 2>~/BrettSpiel_Backend/logs/errOut.txt &
echo Started
