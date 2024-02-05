#!/bin/sh

yarn install

yarn prisma migrate dev

yarn prisma generate

exec yarn start:dev

# echo "EntryPoitm"