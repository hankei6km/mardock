ARG BASE_IMAGE

FROM ${BASE_IMAGE} as site_base


FROM site_base as site_cache

USER "root"

# runner の image から作成された container で next build したサイトのキャッシュ.
# next build すると .next/ 以下が必ず変更されるので、
# docker build としてはキャッシュに含めない.
COPY "cache.tar.gz" /tmp/"cache.tar.gz"
RUN tar -zxf /tmp/cache.tar.gz \
    && rm /tmp/cache.tar.gz 

USER "mardock"


FROM site_base as site_public_base

# base 側で変更があればここではキャッシュが使われない.
# できれば base を作成するところからの multi stage にしたいが、
# キャッシュが込み入ってしまうので断念(layer の一貫性を優先).
# .mardock のキャッシュが大きいので base 的なものを作成しているが、
# これも今回は各 stage を matrix で build しているので意味はない.
COPY --from=site_cache --chown="mardock:users" "/home/mardock/mardock/public" "/home/mardock/mardock/public"


FROM site_public_base as site_runner

COPY --from=site_cache --chown="mardock:users" "/home/mardock/mardock/.next" "/home/mardock/mardock/.next"

ENTRYPOINT ["/docker-entrypoint"]


FROM site_public_base as site_runner-with-cache

COPY --from=site_cache --chown="mardock:users" "/home/mardock/mardock/.mardock" "/home/mardock/mardock/.mardock"

COPY --from=site_cache --chown="mardock:users" "/home/mardock/mardock/.next" "/home/mardock/mardock/.next"

ENTRYPOINT ["/docker-entrypoint"]


FROM site_base as site_runner-only-cache

COPY --from=site_cache --chown="mardock:users" "/home/mardock/mardock/.mardock" "/home/mardock/mardock/.mardock"

ENTRYPOINT ["/docker-entrypoint"]
