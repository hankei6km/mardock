#!/bin/bash

yarn --cwd "${MARDOCK_CWD}" api:build && yarn --cwd "${MARDOCK_CWD}" config:fetch

SCRIPT_NAME="start"

if test "$(id -u)" -eq 0; then
  exec su-exec "${MARDOCK_USER}" yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}"
else
  exec yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}"
fi
