#!/bin/sh

cd ~/BrettSpiel_Backend/logs
logName="$(ls -rt | tail -n1)"
echo
echo
echo Logfile is $logName
echo
createDate=$(logName:0:10)
echo $(date -d @$createDate)
echo $(date -d @$(stat -c %Y $logName))
echo ==============================
cat $logName
