@echo off
echo ============================================
echo   Guvenlik Haritasi - Baslangic Scripti
echo ============================================
echo.

REM MongoDB kontrolu
echo [1/4] MongoDB kontrolu yapiliyor...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo   [OK] MongoDB calisiyor
) else (
    echo   [!] MongoDB calismiyordur. Lutfen mongod komutunu calistirin.
    echo   Devam etmek icin bir tusa basin...
    pause >nul
)
echo.

REM .env dosyasi kontrolu
echo [2/4] .env dosyasi kontrolu...
if exist .env (
    echo   [OK] .env dosyasi mevcut
) else (
    echo   [!] .env dosyasi bulunamadi. Olusturuluyor...
    copy .env.example .env
    echo   [!] Lutfen .env dosyasini duzenleyin ve Google Maps API key ekleyin!
    notepad .env
)
echo.

REM npm install kontrolu
echo [3/4] Node modules kontrolu...
if exist node_modules (
    echo   [OK] Node modules mevcut
) else (
    echo   [!] Node modules bulunamadi. Yukleniyor...
    call npm install
)
echo.

REM Veritabani ilklendirme
echo [4/4] Veritabani ilklendirmek ister misiniz? (E/H)
set /p init_db="Secim: "
if /i "%init_db%"=="E" (
    echo   Veritabani ilklendiriliyor...
    call npm run init-db
)
echo.

echo ============================================
echo   Sunucu baslatiliyor...
echo ============================================
echo.
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Durdurmak icin Ctrl+C basin
echo.

REM Start backend and frontend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "npm run client"

echo.
echo   Sunucular baslatildi!
echo   Tarayicinizda http://localhost:3000 adresini acin
echo.
pause
