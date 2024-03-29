FROM node:14-buster-slim as base

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update \ 
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      git \
      zip \
    && apt-get -y clean \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -g "users" --uid "10000" "mardock" \
    && mkdir "/home/mardock/mardock" \
    && chown "mardock:users" "/home/mardock/mardock"


# https://nextjs.org/docs/deployment#docker-image
# 上記を参考にするが、1つの image で build と start に対応させる予定.
# docker build で next build すると secret が image に埋め込まれる危険がある
# (と思う).
FROM base as modules

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN mkdir -p /tmp/mardock/scripts \
    && chown "mardock:users" "/tmp/mardock" \
    && chown "mardock:users" "/tmp/mardock/scripts"

USER "mardock"

COPY --chown="mardock:users" package.json yarn.lock LICENSE /tmp/mardock/
COPY --chown="mardock:users" scripts/open_source_licenses_build.sh /tmp/mardock/scripts/open_source_licenses_build.sh

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


FROM modules as modules_prod

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

USER "mardock"

RUN INST_PATH="/tmp/mardock" \
    # && yarn --cwd "${INST_PATH}" install --no-cache --production --frozen-lockfile \
    && yarn --cwd "${INST_PATH}" install --no-cache --production --ignore-scripts --prefer-offline \
    && yarn --cwd "${INST_PATH}" cache clean


FROM modules as builder

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

USER root

COPY docker-entrypoint* /

RUN chmod a+x /docker-entrypoint \
    && chmod a+x /docker-entrypoint-start.sh \
    && chmod a+x /docker-entrypoint-build.sh \
    && chmod a+x /docker-entrypoint-export.sh \
    && chmod a+x /docker-entrypoint-develop.sh

USER "mardock"

ARG NO_CACHE_CLONE=1
ARG BRANCH=main
RUN echo "${NO_CACHE_CLONE}" \
    && INST_PATH="/home/mardock/mardock" \
    && mkdir "$INST_PATH}" \
    && git clone --depth 1 --branch "${BRANCH#refs/heads/}"  https://github.com/hankei6km/mardock.git "${INST_PATH}" \
    # node_modules を必要とする処理を実行するときは cp を行い、削除する \
    # && cp -r /tmp/mardock/node_modules "${INST_PATH}/node_modules" \
    # && yarn --cwd "${INST_PATH}" dirs:build \
    && mkdir "${INST_PATH}/.mardock" \
    && mkdir "${INST_PATH}/.next" \
    && rm  -rf "${INST_PATH}"/.git* \
         #"${INST_PATH}/node_modules" \
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


FROM node:14-buster as runner_base 

RUN apt-get update \ 
    && apt-get install -y --no-install-recommends \
       chromium \
       curl \
       fonts-noto-cjk \
       grep \
    && apt-get -y clean \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -g "users" --uid "10000" "mardock" \
    && mkdir "/home/mardock/mardock" \
    && chown "mardock:users" "/home/mardock/mardock" \
    && curl -o /usr/local/bin/su-exec.c https://raw.githubusercontent.com/ncopa/su-exec/master/su-exec.c \
    && gcc -Wall /usr/local/bin/su-exec.c -o/usr/local/bin/su-exec \
    && chown root:root /usr/local/bin/su-exec \
    && chmod 0755 /usr/local/bin/su-exec \
    && rm /usr/local/bin/su-exec.c \
    && ln -s /usr/bin/chromium /usr/bin/chromium-browser

ENV MARDOCK_USER "mardock:users"
ENV MARDOCK_CWD "/home/mardock/mardock"
ENV IS_DOCKER true

EXPOSE 3000

USER "mardock"
WORKDIR "/home/mardock/mardock"

COPY --from=builder "/docker-entrypoint*" "/"


FROM runner_base as runner

COPY --from=modules --chown="mardock:users" "/tmp/mardock/open_source_licenses.zip" "/home/mardock/mardock/open_source_licenses.zip"
COPY --from=modules --chown="mardock:users" "/tmp/mardock/node_modules" "/home/mardock/mardock/node_modules"

COPY --from=builder --chown="mardock:users" "/home/mardock/mardock/" "/home/mardock/mardock/"

ENTRYPOINT ["/docker-entrypoint"]


FROM runner_base as runner_prod

ENV NODE_ENV production

COPY --from=modules_prod --chown="mardock:users" "/tmp/mardock/open_source_licenses.zip" "/home/mardock/mardock/open_source_licenses.zip"
COPY --from=modules_prod --chown="mardock:users" "/tmp/mardock/node_modules" "/home/mardock/mardock/node_modules"

COPY --from=builder --chown="mardock:users" "/home/mardock/mardock/" "/home/mardock/mardock/"

ENTRYPOINT ["/docker-entrypoint"]
