# FROM node:lts

# WORKDIR /app

# COPY . .

# RUN yarn install

# EXPOSE 4000
# CMD [  "yarn", "start:migrate:dev" ]
FROM node:lts AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN yarn build

FROM node:lts

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD [  "yarn", "start:migrate:prod" ]