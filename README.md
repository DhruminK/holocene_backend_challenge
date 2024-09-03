## Description

This project uses following node and npm versions
- [node](https://nodejs.org/en/download/package-manager) - 18.20.4
- [npm](https://www.npmjs.com/) - 10.7.0

This project uses the following technolgoies
- [Nest](https://github.com/nestjs/nest) for backend server
- [Prisma ORM](https://www.prisma.io/) to connect with the database and provide helper types and functions on the database model
- [Supabase](https://supabase.com/) to host the PostgresSQL database and store the tables and related data

## Project setup

```bash
$ npm install
```

In case a clean database is used, run these commands to get the necessary tables in your database
```bash
$ npx prisma db push
```

Above command generates and PrismaClient by itself in case of any errors regarding Prisma, try running this command
```bash
$ npx prisma generate
```

## Compile and run the project

```bash
# Development Mode
$ npm run start:dev

# Production Mode
$ npm run build
$ npm run start:prod
```

## Files Modifed

This project uses [Nest](https://github.com/nestjs/nest) framework TypeScript starter repo
Since default configuration is being used all changes are made only inside ```src``` folder, here are the files inside ```src``` folder that are nodified
- ```main.ts```
- ```schema``` folder - contains all the schema that are used for validation of request body
- ```prisma``` folder - contains the module that exposes PrismaClient as a service that can be imported inside different modules
- ```plan``` folder - contains controller and services that executes the request for the challenge in question
- ```{root}/prisma/schema.prisma``` - Contains database models

## Route Details
Please find the ```backend_challenge.postman_collection.json``` which contains the postman collection that can be used for testing