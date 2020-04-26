
:: Disable stating every read command
@echo off

SET keyName=%1

ECHO SSH remote triggering of kill
ssh tispyl@tispyl.uber.space -i %userprofile%\.ssh\%keyName% "kill $(netstat -atulpn | grep '41920.*LISTEN.*[0-9]*/node' | sed -rn 's/^.*\s([0-9]*)\/node.*$/\1/p')"

