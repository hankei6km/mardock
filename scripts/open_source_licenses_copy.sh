#!/bin/sh
set -e

PUBLIC_PATH="public"
SRC_LICENSES_ZIP="open_source_licenses.zip"
DEST_LICENSES_ZIP="${PUBLIC_PATH}/open_source_licenses.zip"

test -e "${DEST_LICENSES_ZIP}" && rm "${DEST_LICENSES_ZIP}"

cp "${SRC_LICENSES_ZIP}" "${DEST_LICENSES_ZIP}"
