#!/usr/bin/env bash

#Need pm2 to use this script

cd ./backend_server
npm i

cd ../
npm i

npm run build

rm -r node_modules

pm2 delete remonit
pm2 start ./backend_server/index.js -i 4 --name "remonit" --output /dev/null

echo "Code Succesfully deployed"