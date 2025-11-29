FROM oven/bun:slim

ARG PORT=5002
ARG HOST=0.0.0.0
ARG NODE_ENV=production
ARG LOG_LEVEL=info
ARG CORS_ORIGIN=*

ENV PORT=${PORT}
ENV HOST=${HOST}
ENV NODE_ENV=${NODE_ENV}
ENV LOG_LEVEL=${LOG_LEVEL}
ENV CORS_ORIGIN=${CORS_ORIGIN}

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
COPY bun.lockb /app
RUN bun install

COPY . /app

CMD ["bun", "run", "start"]
