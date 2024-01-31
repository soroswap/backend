# Soroswap Backend

## 1. Set up

First, create the `.env` file from the `.env.example` file and fill in the environment variables.
You can copy the `.env.example` by running the following command:

```bash
cp .env.example .env
```
Once created, fill the variables in the `.env` file.

## 2. Build and run the app using Docker

To run the app, execute the following command:

```bash
docker-compose up
```

If any changes are made to the code, you can rebuild the app by running:

```bash
docker-compose up --build
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