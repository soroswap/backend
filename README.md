# Soroswap Backend

## 1. Set up

First, create the `.env` file from the `.env.example` file and fill in the environment variables.
You can copy the `.env.example` by running the following command:

```bash
cp .env.example .env
```
Once created, fill the `DATABASE_URL` variable with the connection string to your database, in the following format:

```bash
DATABASE_URL=protocol://user:password@host:port/database_name
```

## 2. Build and run the app using Docker

To run the app, execute the following command:

```bash
docker-compose up
```

If any changes are made to the code, you can rebuild the app by running:

```bash
docker-compose up --build
```