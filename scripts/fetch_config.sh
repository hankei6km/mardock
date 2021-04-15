#!/bin/sh
set -e

DRAFTLINT_CONFIG_PATH="src/\$draftlint-config.json"

# 以下のコマンドでは
#  {"config": "実際の JSON 文字列" }
# のように保存される.
# これをシェルスクリプトで展開するのは面倒なので今回は import 側にまかせる.

echo "{\"config\": \"{}\"}"  > "${DRAFTLINT_CONFIG_PATH}" 

if [ "${API_BASE_URL}" != "" -a "${GET_API_KEY}"  != "" ] ; then
  curl "${API_BASE_URL}api/v1/config/draftlint-config?fields=config" -s -H "X-API-KEY:${GET_API_KEY}" \
      > "${DRAFTLINT_CONFIG_PATH}" \
      || echo "{\"config\": \"{}\"}"  \
      > "${DRAFTLINT_CONFIG_PATH}" 
fi