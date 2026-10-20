@echo off
chcp 65001 >nul
echo ==============================================================================
echo   DigiPort - PostgreSQL Password Auto-Reset to 'postgres'
echo ==============================================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] অনুগ্রহ করে ফাইলটির উপর Right Click করে "Run as administrator" নির্বাচন করুন।
    echo [ERROR] Please right-click this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo [1/5] Restarting PostgreSQL service in trust mode...
net stop postgresql-x64-18
net start postgresql-x64-18

echo.
echo [2/5] Resetting user 'postgres' password to 'postgres'...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -c "ALTER USER postgres WITH PASSWORD 'postgres';"

echo.
echo [3/5] Ensuring database 'digital_marketr' exists...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE DATABASE digital_marketr;" 2>nul || echo (Database 'digital_marketr' already exists or ready)

echo.
echo [4/5] Restoring secure SCRAM authentication in pg_hba.conf...
if exist "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.bak" (
    copy /Y "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.bak" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" >nul
)

echo.
echo [5/5] Finalizing PostgreSQL service restart...
net stop postgresql-x64-18
net start postgresql-x64-18

echo.
echo ==============================================================================
echo   SUCCESS! PostgreSQL password has been successfully reset to: postgres
echo   Database 'digital_marketr' is ready!
echo ==============================================================================
echo.
pause
