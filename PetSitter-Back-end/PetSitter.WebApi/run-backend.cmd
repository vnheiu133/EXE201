@echo off
cd /d "%~dp0"
set APPDATA=D:\FPT\Ki 6\Exe201\Exe201\_appdata
set LOCALAPPDATA=D:\FPT\Ki 6\Exe201\Exe201\_appdata\Local
set NUGET_PACKAGES=D:\FPT\Ki 6\Exe201\Exe201\_nuget_packages
dotnet run --no-build --urls http://127.0.0.1:5278
