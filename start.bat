@echo off
echo Dersa Platformunu Baslatmaya Hazırlanıyor...

echo Sunucu aciliyor...
start cmd /k "cd server && npm start"

echo Istemci aciliyor...
start cmd /k "cd client && npm run dev"

echo İki uygulama da baslatildi!
pause
