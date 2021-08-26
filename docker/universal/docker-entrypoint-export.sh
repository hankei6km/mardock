#!/bin/bash

yarn --cwd "${MARDOCK_CWD}" api:build && yarn --cwd "${MARDOCK_CWD}" config:fetch

SCRIPT_NAME="export"
OUT_DIR="${MARDOCK_CWD}/.mardock/out"

if test "$(id -u)" -eq 0; then
  exec su-exec "${MARDOCK_USER}" yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}" -o "${OUT_DIR}"
else
  exec yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}" -o "${OUT_DIR}"
fi
