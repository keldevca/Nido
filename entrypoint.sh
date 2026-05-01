#!/bin/sh
set -e
node ./node_modules/prisma/build/index.js migrate deploy
node server.js
