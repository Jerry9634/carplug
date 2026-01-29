rem cd ..\dev\car-plug-server
rem start "" car-plug-server-win

rem timeout /t 3

rem cd ..\car-plug-app\out\car-plug-app-win32-x64
rem start "" car-plug-app

cd ..\car-plug-server
start "" npm start

timeout /t 3

cd ..\car-plug-monitor
start "" npm start

timeout /t 3

cd ..\launcher
start /max "Zone FRONT(0)" Zone4_Win32 0
rem timeout /t 1

start /max "Zone LEFT(1)"  Zone4_Win32 1
rem timeout /t 1

start /max "Zone RIGHT(2)" Zone4_Win32 2
rem timeout /t 1

start /max "Zone REAR(3)"  Zone4_Win32 3