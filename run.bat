cd ..\dev\car-plug-server
start "" car-plug-server-win

timeout /t 3

cd ..\car-plug-app\out\car-plug-app-win32-x64
start "" car-plug-app