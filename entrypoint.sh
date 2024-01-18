#!/bin/sh

yarn install

yarn prisma migrate deploy

yarn prisma generate

exec yarn start:dev