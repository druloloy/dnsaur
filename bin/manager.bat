@echo off
setlocal

REM Check if running with admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :continue
) else (
    echo Admin rights required. Restarting as administrator...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

:continue

REM Ask for connection source
:choose_connection
echo Select your connection source:
echo a. Wi-Fi
echo b. Ethernet
echo c. Ethernet 2
set /p connection=Enter your choice (a/b/c): 

if "%connection%"=="a" (
    set "connection_name=Wi-Fi"
    goto menu
)
if "%connection%"=="b" (
    set "connection_name=Ethernet"
    goto menu
)
if "%connection%"=="c" (
    set "connection_name=Ethernet 2"
    goto menu

)
echo Invalid choice, please try again.
goto choose_connection

:menu
echo You selected %connection_name%
echo Do you want to enable or disable DNS protection?
echo a. Enable Protection
echo b. Disable Protection
echo 0. Exit
set /p choice=Enter your choice (a/b/0): 

if "%choice%"=="a" goto choose_provider
if "%choice%"=="b" goto disable_dns
if "%choice%"=="0" goto end
echo Invalid choice, please try again.
goto menu

REM Ask for DNS provider
:choose_provider
echo Select your Protection:
echo a. NextDNS (Recommended)
echo b. AdGuard
set /p dns_choice=Enter your choice (a/b): 

if "%dns_choice%"=="a" (
    set "dns_server1=45.90.28.197"
    set "dns_server2=45.90.30.197"
    goto enable_dns
)
if "%dns_choice%"=="b" (
    set "dns_server1=94.140.14.14"
    set "dns_server2=94.140.15.15"
    goto enable_dns
)
echo Invalid choice, please try again.
goto choose_provider


:enable_dns
echo Enabling DNS protection on %connection_name%...
netsh interface ip set dns name="%connection_name%" static %dns_server1%
netsh interface ip add dns name="%connection_name%" %dns_server2% index=2
echo DNS protection is now set for %connection_name%.

echo If you choose NextDNS as your provider, you may visit the dashboard at https://my.nextdns.io/ and link your IP address to manage your DNS. However, protection should still work without linking your IP Address.
goto end

:disable_dns
echo Disabling DNS protection on %connection_name%...
netsh interface ip set dns name="%connection_name%" dhcp
echo DNS has been reset to automatic for %connection_name%.
goto end

:end
echo Operation completed.
pause
endlocal
