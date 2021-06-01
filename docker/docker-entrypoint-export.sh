#!/bin/ash

SCRIPT_NAME="export"
OUT_DIR="${MARDOCK_CWD}/.mardock/out"

if test "$(id -u)" -eq 0; then
  exec su-exec "${MARDOCK_USER}" yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}" -o "${OUT_DIR}"
else
  exec yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}" -o "${OUT_DIR}"
fi
