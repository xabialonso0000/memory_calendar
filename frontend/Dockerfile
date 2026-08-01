# build stage
FROM node:20 as build

WORKDIR /app

COPY package*.json ./

RUN rm -f package-lock.json && rm -rf node_modules && yarn install --frozen-lockfile

COPY . .

RUN yarn build

# production stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]