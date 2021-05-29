#!/bin/ash

if test "$(id -u)" -eq 0; then
  exec su-exec "${MARDOCK_USER}" yarn --cwd "${MARDOCK_CWD}" dev
else
  exec yarn --cwd "${MARDOCK_CWD}" dev
fi
