FROM alpine:edge as base

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk --no-cache add \
       libc6-compat \
       nodejs \
       yarn \
    && adduser -S -g "users" --uid "1000" "mardock" \
    && mkdir "/home/mardock/mardock" \
    && chown "mardock:users" "/home/mardock/mardock"


FROM base as modules

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk add --no-cache \
       zip \
    && mkdir -p /tmp/mardock/scripts
COPY package.json yarn.lock LICENSE /tmp/mardock/
COPY scripts/open_source_licenses_build.sh /tmp/mardock/scripts/open_source_licenses_build.sh

# https://nextjs.org/docs/deployment#docker-image
# next build と next start 用に image を分けるということ?
RUN INST_PATH="/tmp/mardock" \
    # && yarn --cwd "${INST_PATH}" install --no-cache --production --frozen-lockfile \
    && yarn --cwd "${INST_PATH}" install --no-cache --frozen-lockfile \
    && yarn --cwd "${INST_PATH}" remove jest \
       @testing-library/jest-dom \
       @testing-library/react \
       jest-fetch-mock \
       jest-watch-typeahead \
    && yarn --cwd "${INST_PATH}" licenses:build \
    && yarn --cwd "${INST_PATH}" cache clean


FROM modules as builder

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

COPY docker-entrypoint* /

RUN apk add --no-cache \
       git \
    && chmod u+x /docker-entrypoint \
    && chmod u+x /docker-entrypoint-start.sh \
    && chmod u+x /docker-entrypoint-build.sh \
    && chmod u+x /docker-entrypoint-export.sh \
    && chmod u+x /docker-entrypoint-develop.sh

USER "mardock"

ARG NO_CACHE_CLONE=1
ARG BRANCH=main
RUN echo "${NO_CACHE_CLONE}" \
    && INST_PATH="/home/mardock/mardock" \
    && mkdir "$INST_PATH}" \
    && git clone --depth 1 --branch "${BRANCH#refs/heads/}"  https://github.com/hankei6km/mardock.git "${INST_PATH}" \
    && cp -r /tmp/mardock/node_modules "${INST_PATH}/node_modules" \
    && yarn --cwd "${INST_PATH}" dirs:build \
    && rm  -rf "${INST_PATH}"/.git* \
         "${INST_PATH}/node_modules" \
         "${INST_PATH}/.vercelignore" \
         "${INST_PATH}/.prettierrc" \
         "${INST_PATH}/README.md" \
         "${INST_PATH}/docker" \
         "${INST_PATH}/jest.config.js" \
         "${INST_PATH}/vercel.json" \
         "${INST_PATH}/sandbox.config.json" \
         "${INST_PATH}/setupTests.ts" \
         "${INST_PATH}/test" \
    && find "${INST_PATH}" -name "*.test.ts*" -type f -print0 | xargs -0 rm



FROM base as runner

RUN apk add --no-cache \
       chromium  \
       curl \
       font-noto-cjk \
       grep \
       su-exec

ENV MARDOCK_USER "mardock:users"

USER "mardock"
ENV IS_DOCKER true
WORKDIR "/home/mardock/mardock"

COPY --from=modules "/tmp/mardock/node_modules" "/home/mardock/mardock/node_modules"
COPY --from=modules "/tmp/mardock/open_source_licenses.zip" "/home/mardock/mardock/open_source_licenses.zip"

COPY --from=builder "/docker-entrypoint*" "/"
COPY --from=builder --chown="mardock:users" "/home/mardock/mardock/" "/home/mardock/mardock/"

ENTRYPOINT ["/docker-entrypoint"]
