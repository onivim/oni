@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
call "%~dp0..\..\..\..\Oni.exe" "%~dp0..\..\lib\cli\src\cli.js" %*
endlocal