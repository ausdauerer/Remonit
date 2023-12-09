#!/usr/bin/env bash

#Need pm2 to use this script

cd ./backend_server
npm i
cd ../

pm2 delete remonit
pm2 start ./backend_server/index.js -i 4 --name "remonit" --output /dev/null

echo "Code Succesfully deployed"