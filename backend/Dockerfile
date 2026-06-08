FROM denoland/deno:2.3.3

WORKDIR /app

COPY deno.json deno.lock main.ts scheduler.ts ./
COPY src/ src/

RUN deno cache --frozen main.ts

ENV PORT=8080
ENV SITES_DIR=/data/sites

EXPOSE 8080

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "--allow-write=/data", "--no-prompt", "main.ts"]
