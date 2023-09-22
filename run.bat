cd .\car-plug-server
start "" npm start

cd ..\car-plug-viewer
start "" serve -s -l 3001

cd ..\dashboard-pc\dashboard-proxy-server
start "" npm start

cd ..\dashboard-client
start "" serve -s -l 3002

start chrome http://localhost:3001/
start chrome http://localhost:3002/