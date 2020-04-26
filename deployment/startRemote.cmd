
:: Disable stating every read command
@echo off

SET keyName=%1

ECHO SSH remote triggering of nohup npm runProd
ssh tispyl@tispyl.uber.space -i %userprofile%\.ssh\%keyName% "cd ~/BrettSpiel_Backend && nohup npm run runProd"

