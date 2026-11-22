FROM node:24-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm install

FROM dependencies AS build
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV BACKEND_PORT=3005
ENV BACKEND_INTERNAL_URL=http://127.0.0.1:3005
ENV DATA_DIR=/app/data
ENV DB_PATH=/app/data/tomoni.sqlite
ENV ALLOW_EMAIL_SEND=false
ENV EMAIL_INTERVAL_MS=3000
ENV SMTP_ENCRYPTION_KEY=kTnmw6nR8CvRKTeYPJkB/7Q1uOb/nEmNpwE37SbTsic=
ENV PUBLIC_URL=http://gov81o3p7ks6qel5byxim8c2.5.196.7.30.sslip.io

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server.mjs ./server.mjs
COPY --from=build /app/admin ./admin
COPY --from=build /app/backend ./backend
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/src/backend-launcher.mjs ./src/backend-launcher.mjs

RUN mkdir -p /app/data
EXPOSE 3000

CMD ["npm", "run", "start"]
