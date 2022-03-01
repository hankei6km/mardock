#!/bin/sh
set -e

MARDOCK_PATH=".mardock"
CACHE_PATH="${MARDOCK_PATH}/cache"
CACHE_DECK_PATH="${CACHE_PATH}/deck"

# .mardock は存在していたら出来る限り再利用する.
test -d "${MARDOCK_PATH}" || mkdir "${MARDOCK_PATH}"
test -d "${CACHE_PATH}" || mkdir "${CACHE_PATH}" 
test -d "${CACHE_DECK_PATH}" || mkdir "${CACHE_DECK_PATH}" 


ASSETS_PATH="public/assets"
ASSETS_DECK_PATH="public/assets/deck"
ASSETS_FEEDS_PATH="public/assets/feeds"

# public/assets は next build 等では "rebuild" 指定され、
# 再作成する
test "${1}" = "rebuild" && test -d "${ASSETS_PATH}" && rm -r "${ASSETS_PATH}"
test -d  "${ASSETS_DECK_PATH}" || mkdir -p "${ASSETS_DECK_PATH}" 
test -d  "${ASSETS_FEEDS_PATH}" || mkdir -p "${ASSETS_FEEDS_PATH}" 
