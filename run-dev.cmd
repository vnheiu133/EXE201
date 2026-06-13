@echo off
set "ROOT=%~dp0"
set "BE_DIR=%ROOT%PetSitter-Back-end\PetSitter.WebApi"
set "FE_DIR=%ROOT%PetSitter"

del "%BE_DIR%\_backend.out.log" "%BE_DIR%\_backend.err.log" "%FE_DIR%\_frontend.out.log" "%FE_DIR%\_frontend.err.log" 2>nul

start "PetSitter Backend" /b cmd /c ""%BE_DIR%\run-backend.cmd" 1> "%BE_DIR%\_backend.out.log" 2> "%BE_DIR%\_backend.err.log""
start "PetSitter Frontend" /b cmd /c ""%FE_DIR%\run-frontend.cmd" 1> "%FE_DIR%\_frontend.out.log" 2> "%FE_DIR%\_frontend.err.log""

echo Backend:  http://127.0.0.1:5278
echo Frontend: http://127.0.0.1:3000
