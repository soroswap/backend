# Soroswap Backend
Read more about the Soroswap.Finance Stack in in docs.soroswap.finance

## 1. Set up

First, create the `.env` file from the `.env.example` file and fill in the environment variables.

You can copy the `.env.example` by running the following command:

```bash
cp  .env.example  .env
```
Once created: fill the `POSTGRES_URL` variable with the connection string to your database, in the following format: 

```bash
POSTGRES_URL=protocol://user:password@host:port/database_name
``` 
and fill in the remaining values.

If you are developing locally and using the PostgreSQL container of the Docker Compose, your setup should be:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=postgresdb
POSTGRES_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgdb:5432/${POSTGRES_DATABASE}?schema=public
```
  
## 2. Build and run the app using Docker

To run the app, execute the following command:

```bash
docker-compose  up
```

If any changes are made to the code, you can rebuild the app by running:

```bash
docker-compose  up  --build
```

## 3. Run the Prisma migrations, generate the Prisma client and run the app

This should be made inside the `backend_backend_1` container, so in toder to do this. First, enter to the backend Docker container by running:

```bash
docker exec -it backend_backend_1 bash
```

Once inside the container, run the following commands:

```bash
yarn install # need to run this only once
yarn prisma migrate dev # need to run this only once
yarn prisma generate # need to run this only once
yarn start:dev # need to run this every time
```

**Note:** If you want to check what are the containers name, you can just run:

```bash
docker ps
```
Whith this, you can enter to any Docker container's terminal by running:

```bash
docker exec -it <CONTAINER_NAME> bash
```

## 4. Inspect database:

By default, Prisma provides a "studio" to inspect the tables.

to open it inside the docker container you can run
```bash
yarn prisma studio
```
## 5. Available Requests


**1. Subscribe to pairs:**

```
curl -X POST \
  http://0.0.0.0:4000/pairs \
  -H 'apiKey: <your_api_key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "contractId": [
      "CBV3WDVJ7NC3RKVPBKLWXD46I6HL6GBZHSRBMJ6SLUAUISGITAB3DQO7"
    ],
    "keyXdr": "AAAAFA==",
    "durability": "persistent"
  }'
```

**2. Set counter value:**
```
curl -X POST \
  http://0.0.0.0:4000/pairs/count \
  -H 'apiKey: <your_api_key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "number": 8
  }'

```
**3. Get mercury pairs count:**

```
curl -X GET \
  http://0.0.0.0:4000/pairs/mercury-count \
  -H 'apiKey: <your_api_key>'

```
**4. Get DB count:**

```
curl -X GET \
  http://0.0.0.0:4000/pairs/count \
  -H 'apiKey: <your_api_key>'

```

**5. Get all liquidity pools:**

```
curl -X POST \
  http://0.0.0.0:4000/pairs/all?network=testnet \
  -H 'apiKey: <your_api_key>'

```


curl -X POST \
  http://0.0.0.0:4000/pairs \
  -H 'apiKey: cualquiercosa' \
  -H 'Content-Type: application/json' \
  -d '{
    "contractId": [
      "CBV3WDVJ7NC3RKVPBKLWXD46I6HL6GBZHSRBMJ6SLUAUISGITAB3DQO7"
    ],
    "keyXdr": "AAAAFA==",
    "durability": "persistent"
  }'


curl -X POST \
  http://0.0.0.0:4000/pairs/count \
  -H 'apiKey: <your_api_key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "number": 8
  }'


  curl -X POST \
  http://0.0.0.0:4000/pairs/count \
  -H 'apiKey: cualquiercosa' \
  -H 'Content-Type: application/json' \
  -d '{
    "number": 8
  }'


  curl -X GET \
  http://0.0.0.0:4000/pairs/mercury-count \
  -H 'apiKey: cualquiercosa'


  curl -X GET \
  http://0.0.0.0:4000/pairs/count \
  -H 'apiKey: cualquiercosa'


  curl -X POST \
  http://0.0.0.0:4000/pairs/all?network=testnet \
  -H 'apiKey: cualquiercosa'