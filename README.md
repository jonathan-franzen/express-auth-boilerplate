# Express Auth Boilerplate

#### API for Authentication using

- [Express.js](https://github.com/expressjs/express)
- [Typescript](https://github.com/microsoft/TypeScript)
- [Prisma ORM](https://github.com/prisma/prisma)
- [JWT Authentication](https://github.com/auth0/node-jsonwebtoken)
- [Nodemailer]()
- [Serverless](https://www.serverless.com/) for AWS Lambda deployment

### DEMO

Frontend built with Next.js and works out of the box:

[next-external-auth-boilerplate](https://github.com/jonathan-franzen/next-external-auth-boilerplate)

## Usage

### Prerequisites

Clone this repository.

**AND**

Install [docker](https://www.docker.com/) and run `docker compose up`

**OR**

Setup and run your own instance of [postgres](https://www.postgresql.org/), [mailhog](https://github.com/mailhog/MailHog)(or other mailcatcher software) and [Elastic MQ](https://github.com/softwaremill/elasticmq)(If using serverless)

### Install & run locally

- Run `yarn install` to install dependencies.
- Run `yarn prisma generate` & `yarn prisma migrate dev`
- Optionally, initialize the database with default users by running `yarn command db:seed`
- Start by running `yarn dev` -- or run `yarn serverless-dev` to emulate [AWS lambda](https://aws.amazon.com/pm/lambda) locally.

If using the provided docker-compose setup, you can view emails on http://localhost:8025/.

## Customizations

### Remove serverless

If you would rather host this app another way, you can simply remove serverless by following these steps:

1. `yarn remove serverless serevrless-offline serverless-offline-sqs serverless-http serverless-console`
2. Open `package.json` and remove the script `serverless-dev`
3. Delete files `serverless.yml`, `src/console.ts` && `src/worker.ts`
4. In `src/server.ts` you can remove the import of `serverless-http`, and remove the `const handler` at the bottom.
5. In `.env` & `src/constancts/environment.constants.ts` remove `WORKQUEUE_URL` & `AWS_REGION`.
6. In `docker-compose.yml`, remove the `elasticmq`- container.

### Environment variables

copy `.env` and paste it into `.env.local`.

All variables are pretty self-explanatory...

For `ACCESS_TOKEN_SECRET` & `REFRESH_TOKEN_SECRET`, you should generate secure values using:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Feel free to configure `DATABASE_URL` along with Prisma if you would rather use another DB Engine.

### Commands

To run commands, just run `yarn command { command }`. This will call commands setup with [commander](https://github.com/tj/commander.js).

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

### Serverless

The project is built to work with serverless & AWS Lambda. To test this out, the project is pre-configured with serverless-offline to emulate the hosting locally.

Deploying serverless applications comes with a few adjustments.

#### Console

To run CLI-commands, like database migrations, or commander-commands, you need to invoke a console-function in Lambda.

This is set up in `src/console.ts`, and initiated in `serverless.yml` on the function `console`.

Simply run:

```
yarn serverless invoke local --function console --data "yarn command db:seed"
```

To init the database when running on serverless-offline(`yarn serverless-dev`).

#### Worker

To trigger non-blocking events like, sending emails, use SQS with a handler-function that listens to new messages.

This is set up in `src/worker.ts` and initiated in `serverless.yml` on the function `worker`.

Create and register new events in `src/events/index.ts` & by updating `EventsInterface`

```
// src/interfaces/events/events.interface.ts
import SendEmailOptionsMailerInterface from '@/interfaces/mailer/send-email-options.mailer.interface.js';

interface EventsInterface {
	sendEmail: SendEmailOptionsMailerInterface;
	... Add more eventTypes here
}

export default EventsInterface;

__________________________________________________________________

// src/events/index.ts

const eventManager = new EventManager<Events>(WORKQUEUE_URL, { region: AWS_REGION }, !AWS_LAMBDA_FUNCTION_NAME);

eventManager.on('sendEmail', (data: SendEmailOptionsMailerInterface) => mailerService.sendEmail(data));

... Register more events here

export default eventManager;
```

And then simply call the event like this

`await this.eventManager.send('sendEmail', emailOptions);`
