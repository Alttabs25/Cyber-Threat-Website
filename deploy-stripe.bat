@echo off
echo ========================================
echo Cookie Haven - Deploy Stripe Server
echo ========================================
echo.

cd server

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Testing server locally (will run for 5 seconds)...
start /B npm start
timeout /t 5 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1

echo.
echo [3/4] Deploying to Vercel...
echo Follow the prompts to deploy your server!
echo.
call vercel

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo IMPORTANT NEXT STEPS:
echo 1. Copy your Vercel URL (shown above)
echo 2. Open .env.production in the root folder
echo 3. Update VITE_STRIPE_SERVER_URL with your Vercel URL
echo 4. Run: npm run build
echo 5. Run: npx cap sync android
echo 6. Rebuild your APK in Android Studio
echo.
echo ========================================
pause
