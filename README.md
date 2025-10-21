# Express Auth Boilerplate

#### API for Authentication using

- [Express.js](https://github.com/expressjs/express)
- [Typescript](https://github.com/microsoft/TypeScript)
- [Prisma ORM](https://github.com/prisma/prisma)
- [JWT Authentication](https://github.com/auth0/node-jsonwebtoken)
- [Nodemailer]()

### DEMO

Frontend built with Next.js and works out of the box:

[next-external-auth-boilerplate](https://github.com/jonathan-franzen/next-external-auth-boilerplate)

## Usage

### Prerequisites

Clone this repository.

**AND**

Install [docker](https://www.docker.com/) and run `docker compose up`

**OR**

Setup and run your own instance of [postgres](https://www.postgresql.org/) and [mailhog](https://github.com/mailhog/MailHog)(or other mailcatcher software)

### Install & run locally

- Run `pnpm install` to install dependencies.
- Run `pnpm prisma:generate` & `pnpm prisma:create-migartion`
- Optionally, initialize the database with default users by running `pnpm command db:seed`
- Start by running `pnpm dev`

If using the provided docker-compose setup, you can view emails on MailHog dashboard at http://localhost:8025/.

## Customizations

### Environment variables

copy `.env` and paste it into `.env.local`.

All variables are pretty self-explanatory...

For `ACCESS_TOKEN_SECRET` & `REFRESH_TOKEN_SECRET`, you should generate secure values using:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Feel free to configure `DATABASE_URL` along with Prisma if you would rather use another DB Engine.

### Commands

To run commands, just run `pnpm command { command }`. This will call commands setup with [commander](https://github.com/tj/commander.js).

Available commands:

- `db:seed`
- `db:delete-expired-tokens`

To create new commands, just declare the command like this:

```
const deleteExpiredTokensDbCommand: Command = new Command('db:delete-expired-tokens')
.description('Delete expired tokens in database')
.action(deleteExpiredTokens);
```

and make sure it is added to commander in `src/commands/index.ts`.
