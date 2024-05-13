# docker run -p 4000:4000 --network backend_app-network --env-file .env.test backend-redis
FROM node:lts AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN yarn build

FROM node:lts
#REDIS SETUP
RUN echo "Installing Redis..."
RUN apt-get update
RUN apt-get upgrade -y
RUN apt install lsb-release curl gpg -y
RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list
RUN apt-get update
RUN apt-get install redis -y

#NEST APP
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# COPY --chmod=777 --from=builder /app/start_prod.sh ./start_prod.sh

EXPOSE 4000
CMD ./start_prod.sh