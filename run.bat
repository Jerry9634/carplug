cd .\car-plug-server
start "" car-plug-server-win

timeout /t 3

cd ..\vehicle-simulator
start "" serve -s -l 3000

timeout /t 1

cd ..\car-plug-viewer
start "" serve -s -l 3001

timeout /t 3

start chrome http://localhost:3000/
start chrome http://localhost:3001/