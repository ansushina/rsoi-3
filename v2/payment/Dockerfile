FROM node:14.4.0-slim as build
ARG PORT

WORKDIR /app

COPY package*.json ./
RUN npm i

RUN echo PGUSER=$PGUSER >> .env
RUN echo PGPASSWORD=$PGPASSWORD >> .env
RUN echo PGHOST=$PGHOST >> .env
RUN echo PGPORT=$PGPORT >> .env
RUN echo PGDATABASE=$PGDATABASE >> .env
RUN echo PORT=$PORT >> .env

COPY . /app
RUN npm run build


FROM node:14.4.0-slim as prod

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
COPY --from=build /app/dist ./dist

CMD [ "npm", "run", "start:prod" ]