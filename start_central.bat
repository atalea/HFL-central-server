@echo off
title = Central Server
set /p "PORT=Enter Port For Central to Run on: "
set /p "HOST=Enter Central Server IP to run on(local-IP): "
node central\index.js
pause