# Soroswap Backend
Read more about the Soroswap.Finance Stack in in docs.soroswap.finance

## 1. Set up

First, create the `.env` file from the `.env.example` file and fill in the environment variables.

You can copy the `.env.example` by running the following command:

```bash
cp  .env.example  .env
```

Once created: fill the `DATABASE_URL` variable with the connection string to your database, in the following format:

```bash
DATABASE_URL=protocol://user:password@host:port/database_name
``` 
and fill in the remaining values.

If you are developing locally and using the PostgreSQL container of the Docker Compose, your setup should be:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=postgresdb
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgdb:5432/${POSTGRES_DB}?schema=public
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

To see the running containers, run:

```bash
docker ps
```

Enter the Docker container of the backend by running:

```bash
docker exec -it <CONTAINER_NAME> bash
```

Once inside the container, run the following commands:

```bash
yarn install
yarn prisma migrate dev
yarn prisma generate
yarn start:dev
```

## 4. Inspect database:

By default, the development container creates a pgAdmin instance to inspect your data. You can access it in two ways:
-  **Through a web browser:**  Open  `http://localhost:5050`  in your browser.
-  **Through the command line:**  Use the  `pgAdmin`  command-line interface provided within the container.

**Credentials:**
-   Log in using the credentials set in your  `.env`  file.

**Registering the Postgres Server:**
To connect to your database in pgAdmin, register a new server with the following configuration:

| General |  | |
|--|--|--|
|  | Name: Backend| |
| **Connection** | | |
||Host name / address: | pgdb |
||Port:|5432
||Username:|`.env.POSTGRES_USER`
||Password:|`.env.POSTGRES_PASSWORD`

Click "Save" after entering the configuration details.

**Navigating to the Tables:**

To inspect the tables within your database, navigate to the following location in pgAdmin:

`Servers > Backend > Databases > postgresdb > Schemas > public > Tables`


## 5. Test that everything is working:
```bash
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
```

Will this work??