cd .\car-plug-server
start "" car-plug-server-win

timeout /t 3

cd ..\vehicle-simulator\proxy-server
start "" touchscreen-proxy-server-win

cd ..
start "" serve -s -l 3000

cd ..\car-plug-viewer
start "" serve -s -l 3001

timeout /t 3

start chrome http://localhost:3000/
start chrome http://localhost:3001/
start chrome http://localhost:3002/