FROM oven/bun:slim

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY bun.lockb /app
RUN bun install

COPY . /app

CMD ["bun", "run", "dev"]

