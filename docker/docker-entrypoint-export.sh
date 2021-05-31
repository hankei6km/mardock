#!/bin/ash

SCRIPT_NAME="export"

if test "$(id -u)" -eq 0; then
  exec su-exec "${MARDOCK_USER}" yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}"
else
  exec yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}"
fi
