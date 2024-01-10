#!/bin/sh

npm install

npx prisma generate

exec npm run start:dev