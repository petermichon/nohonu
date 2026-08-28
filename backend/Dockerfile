FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json main.ts prisma.config.ts ./
COPY src/ src/
COPY prisma/ prisma/

RUN npx prisma generate

ENV PORT=8080
ENV SITES_DIR=/data/sites

EXPOSE 8080

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
