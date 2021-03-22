#!/bin/sh
set -e

ASSETS_PATH="public/assets"
WORK_PATH="work"

test -d "${ASSETS_PATH}" && rm -r "${ASSETS_PATH}"
mkdir -p "${ASSETS_PATH}/images" 
mkdir -p "${ASSETS_PATH}/pdf" 

test -d "${WORK_PATH}" && rm -r "${WORK_PATH}"
mkdir -p "${WORK_PATH}/images" 