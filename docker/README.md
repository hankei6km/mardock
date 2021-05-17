# mardock docker image


## ローカルで開発用のコンテナを実行

`docker run` で `--env-file` で指定すファイルを以下のように作成。
```
API_BASE_URL=https://<service-name>.microcms.io/
GET_API_KEY=<SECRET KEY>
PREVIEW_SECRET=<SECRET KEY>
BASE_URL=localhost:3000
```

開発用のコンテナでも PDF 等を作成する場合は以下も追加する(experimental)。
```
BUILD_ASSETS_DECK=dynamic
```

コンテナの作成。
```
$ docker run --init --rm -it --env-file .env -p 3000:3000 mardock-develop:????
```
