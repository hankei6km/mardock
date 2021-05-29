ARG USER=mardock
ARG USER_ID=1000
ARG USER_GID=users

FROM alpine:edge as builder

ARG USER
ARG USER_ID
ARG USER_GID

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk update \
    && apk add --no-cache --virtual .build-deps \
       git \
       libc6-compat \
       nodejs \
       yarn \
       zip \
    && adduser -S -g "${USER_GID}" --uid "${USER_ID}" "${USER}"

COPY --chown="${USER}":"${USER_GID}" docker-entrypoint /
COPY --chown="${USER}":"${USER_GID}" docker-entrypoint-build.sh /
COPY --chown="${USER}":"${USER_GID}" docker-entrypoint-develop.sh /

USER "${USER}"

ARG NO_CACHE_CLONE=1
ARG BRANCH=main
RUN echo "${NO_CACHE_CLONE}" \
    && git clone --depth 1 --branch "${BRANCH#refs/heads/}"  https://github.com/hankei6km/mardock.git "/home/${USER}/mardock" \
    && yarn --cwd "/home/${USER}/mardock" install --no-cache --frozen-lockfile \
    && yarn --cwd "/home/${USER}/mardock" licenses:build \
    && yarn --cwd "/home/${USER}/mardock" dirs:build \
    && yarn --cwd "/home/${USER}/mardock" cache clean

USER root
RUN chmod u+x /docker-entrypoint \
    && chmod u+x /docker-entrypoint-build.sh \
    && chmod u+x /docker-entrypoint-develop.sh \
    && apk del --force-broken-world .build-deps

USER "${USER}"

FROM alpine:edge as runner

ARG USER
ARG USER_ID
ARG USER_GID

RUN apk update \
    && apk add --no-cache \
       chromium  \
       curl \
       font-noto-cjk \
       grep \
       libc6-compat \
       nodejs \
       su-exec \
       yarn \
    && adduser -S -g "${USER_GID}" --uid "${USER_ID}" "${USER}"

ENV MARDOCK_USER "${USER}:$USER_GID}"

USER "${USER}"
ENV IS_DOCKER true
COPY --from=builder "/docker-entrypoint" "/docker-entrypoint"
COPY --from=builder "/docker-entrypoint"-build.sh "/docker-entrypoint-build.sh"
COPY --from=builder "/docker-entrypoint"-develop.sh "/docker-entrypoint-develop.sh"
COPY --from=builder --chown="${USER}:${USER_GID}" "/home/${USER}/mardock" "/home/${USER}/mardock"

WORKDIR "/home/${USER}/mardock"
ENTRYPOINT ["/docker-entrypoint"]
