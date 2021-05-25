ARG USER=mardock
ARG USER_ID=1000
ARG USER_GID=users

FROM alpine:edge as builder

ARG USER
ARG USER_ID
ARG USER_GID

ARG BRANCH=main

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk update \
    && apk add --no-cache --virtual .build-deps \
       git \
       nodejs \
       yarn \
       zip \
    && adduser -S -g "${USER_GID}" --uid "${USER_ID}" "${USER}"

COPY --chown="${USER}":"${USER_GID}" docker-entrypoint /

USER "${USER}"
RUN git clone --depth 1 --branch "${BRANCH#refs/heads/}"  https://github.com/hankei6km/mardock.git "/home/${USER}/mardock" \
    && yarn --cwd "/home/${USER}/mardock" install --no-cache --frozen-lockfile \
    && yarn --cwd "/home/${USER}/mardock" licenses:build \
    && yarn --cwd "/home/${USER}/mardock" dirs:build \
    && yarn --cwd "/home/${USER}/mardock" cache clean

USER root
RUN chmod u+x /docker-entrypoint \
    && apk del --force-broken-world .build-deps

USER "${USER}"

FROM alpine:edge

ARG USER
ARG USER_ID
ARG USER_GID

RUN apk update \
    && apk add --no-cache \
       chromium  \
       curl \
       font-noto-cjk \
       grep \
       nodejs \
       su-exec \
       yarn \
    && adduser -S -g "${USER_GID}" --uid "${USER_ID}" "${USER}"

USER "${USER}"
ENV IS_DOCKER true
COPY --from=builder "/docker-entrypoint" "/docker-entrypoint"
COPY --from=builder --chown="${USER}:${USER_GID}" "/home/${USER}/mardock" "/home/${USER}/mardock"

WORKDIR "/home/${USER}/mardock"
ENTRYPOINT ["/docker-entrypoint"]
