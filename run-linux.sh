bash -c "echo; cd ./car-plug-server; ./car-plug-server-linux" &

bash -c "echo; cd ./vehicle-simulator; ./vehicle-simulator-linux" &

bash -c "echo; cd ./car-plug-viewer; ./car-plug-viewer-linux" &

timeout 3

google-chrome http://localhost:3000/ &
google-chrome http://localhost:3001/
