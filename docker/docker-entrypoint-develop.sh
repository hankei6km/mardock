#!/bin/ash

echo "CWD: ${MARDOCK_CWD}"
SCRIPT_NAME="dev"

if test "$(id -u)" -eq 0; then
  exec su-exec "${MARDOCK_USER}" yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}"
else
  exec sh -c yarn --cwd "${MARDOCK_CWD}" "${SCRIPT_NAME}"
fi
