cd .\car-plug-server
start "" car-plug-server-win

cd ..\vehicle-simulator
start "" vehicle-simulator-win

cd ..\car-plug-viewer
start "" car-plug-viewer-win

timeout /t 3

start chrome http://localhost:3000/
start chrome http://localhost:3001/