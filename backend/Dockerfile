FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json main.ts ./
COPY src/ src/

ENV PORT=8080
ENV SITES_DIR=/data/sites

EXPOSE 8080

CMD ["node", "--import", "tsx", "main.ts"]
