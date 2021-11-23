FROM node:14.18.1

WORKDIR /api

COPY package*.json ./

RUN yarn install

COPY . .

COPY ./dist ./dist

CMD ["yarn", "start:dev"]
