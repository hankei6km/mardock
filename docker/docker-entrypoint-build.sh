#!/bin/ash

MARDOCK_CWD="/home/mardock/mardock"

if test "$(id -u)" -eq 0; then
  exec su-exec "${MARDOCK_USER}" sh -c 'yarn --cwd "${MARDOCK_CWD}" build && yarn --cwd "${MARDOCK_CWD}" export && touch "${MARDOCK_CWD}/out/.nojekyll"' 
else
  exec sh -c 'yarn --cwd "${MARDOCK_CWD}" build && yarn --cwd "${MARDOCK_CWD}" export && touch "${MARDOCK_CWD}/out/.nojekyll"' 
fi
