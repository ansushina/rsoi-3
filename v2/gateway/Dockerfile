FROM node:14.4.0-slim as build
ARG PORT

WORKDIR /app

COPY package*.json ./
RUN npm i

RUN echo LOYALTY_URL=$LOYALTY_URL >> .env
RUN echo RESERVATION_URL=$RESERVATION_URL >> .env
RUN echo PAYMENT_URL=$PAYMENT_URL >> .env
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