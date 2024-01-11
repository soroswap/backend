#!/bin/sh

npm install

npx prisma migrate deploy

npx prisma generate

exec npm run start:dev