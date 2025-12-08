FROM node:23

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml tsconfig.json .env .env.local ./

COPY src/ ./src/

COPY prisma/ ./prisma/

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm prisma:generate

EXPOSE 8080

CMD ["pnpm", "start"]
