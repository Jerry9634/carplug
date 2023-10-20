cd .\car-plug-server
start "" car-plug-server-win

timeout /t 3

cd ..\vehicle-simulator
start "" serve -s -l 3000

timeout /t 1

cd ..\car-plug-viewer
start "" serve -s -l 3001

cd ..\dashboard-pc\dashboard-proxy-server
start "" dashboard-proxy-server-win

timeout /t 1

cd ..\dashboard-client
start "" serve -s -l 3002

timeout /t 1

start chrome http://localhost:3000/
start chrome http://localhost:3001/
start chrome http://localhost:3002/