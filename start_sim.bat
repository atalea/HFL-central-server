for /f %%a in ('powershell Invoke-RestMethod api.ipify.org') do set PublicIP=%%a
start chrome %PublicIP%:3000/start