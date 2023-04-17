@echo off
title = Central Server
for /f %%a in ('powershell Invoke-RestMethod api.ipify.org') do set PublicIP=%%a
echo %PublicIP%
node central\index.js %PublicIP%
pause