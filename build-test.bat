@echo off
echo 🚀 Testing Pixelsbee Build Process...

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔍 Running lint check...
call npm run lint

echo.
echo 🏗️ Building application...
call npm run build

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 🌐 Your app is ready for deployment!
) else (
    echo ❌ Build failed with error code %ERRORLEVEL%
    echo 💡 Try running: npm run build:no-lint
)

echo.
pause
