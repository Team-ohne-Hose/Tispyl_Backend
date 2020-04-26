
:: Disable stating every read command
@echo off

SET keyName=%1

ECHO Copying %~dp0.. in condensed form to %~dp0..\..\temp_backend_dist
xcopy %~dp0.. %~dp0..\..\temp_backend_dist  /EXCLUDE:%~dp0exclude.txt /S /I

ECHO Move condensed form to remote at ~/BrettSpiel_Backend
scp -r -i %userprofile%\.ssh\%keyName% %~dp0..\..\temp_backend_dist\* tispyl@tispyl.uber.space:~/BrettSpiel_Backend

ECHO Installing node_modules on remote server
ssh tispyl@tispyl.uber.space -i %userprofile%\.ssh\%keyName% "cd ~/BrettSpiel_Backend && npm install"

ECHO Removing temporary folder
rd /S /Q %~dp0..\..\temp_backend_dist
