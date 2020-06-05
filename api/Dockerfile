FROM node:14.4-alpine3.11

LABEL owner="moonactive"

WORKDIR /app

COPY ./app /app

RUN apk update; \
     npm install;

CMD ["npm", "start"]
