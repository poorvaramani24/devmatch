FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD sh -c "serve -s dist -l ${PORT:-3000}"
