FROM node:12-slim as base
ENV NODE_ENV=production
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
EXPOSE 3000
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package.json yarn.lock ./
RUN yarn cache clean

FROM base as dev
ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH
RUN yarn install --only=development
CMD ["yarn", "dev"]

FROM base as source
COPY --chown=node:node . .

FROM source as prod
ENTRYPOINT ["/tini", "--"]
RUN yarn install && yarn cache clean
RUN yarn build
# RUN npx next telemetry disable
CMD ["yarn", "start"]