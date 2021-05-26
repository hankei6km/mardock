# mardock

Marp + CMS のエディターでスライドを作成するウェブアプリ。

「記述の途中」

## 主な機能

- ハイブリッド入力(HTML + Markdown)による手軽な編集
- imgix による画像の編集(まだ未実装)
- 「プレゼンテーション用スライド」「PDF」「PPTX」の自動生成
- 「PDF」などを共有サイトへアップロード(まだ未実装)


なお、デモを兼ねて GitHub Pages へデプロイしていますが、基本的にはローカルでコンテナを動かして利用することを想定しています。


## セットアップ

仕様が固まっていないので暫定的な手順です。

### CMS

スライドソースを入力するたの環境として、microCMS でサービスを作成。

おおまかには、以下の手順でサービスを作成できます。

1. microCMS へユーザーを登録し新規にサービスを作成
1. `docker/api-scheme/` の各スキーマーを元に API を作成
1. `pages` API に以下の id でコンテンツを作成
   - `home`: ホーム画面 (`/`)
   - `deck`: スライド一覧画面 (`/deck`)
   - `docs`: ドキュメント一覧画面 (`/docs`)
   - `about`: アバウト画面 (`/about`)

### コンテナ

#### 環境変数

以下の内容でコンテナに設定する環境変数のファイル(ファイル名は `.env` 等)を作成。

```
API_BASE_URL=https://<サービス名>.microcms.io/
GET_API_KEY=<GET API 用のシークレット>
PREVIEW_SECRET=<画面プレビュー用のシークレット>
BASE_URL=localhost:3000
```

リバースプロキシ等で利用する場合以下を追加。この場合、`BASE_URL` もプロキシに合わせて変更。

```
ASSET_PREFIX=/mardock
BASE_URL=https://<your-docs-server>/mardock

```


スライドを動的生成するときに PDF 等も作成する場合は以下を追加(experimental)。

```
BUILD_ASSETS_DECK=dynamic
```

## 実行

ローカルで `next` が実行されるコンテナを稼働させるための手順。

基本的な構造は Marp-CLI の Docker イメージを参考にしています。`docker run` のフラグ等は [marpteam/marp-cli](https://hub.docker.com/r/marpteam/marp-cli/) が参考になります。

### コンテナの実行

```
# docker run --rm --init --env-file .env --env "LANG=${LANG}" -p 3000:3000 -v "${PWD}/cache:/home/mardock/mardock/.mardock/cache" ghcr.io/hankei6km/mardock_develop:latest
```

以下の点に注意してください。

- 引数に `--init` が必要
- 環境変数の `$LANG` の指定がないと日本語のフォントが使われない


#### PDF 等のキャッシュを永続化

```
# docker run --rm --init --env-file .env --env "LANG=${LANG}" -p 3000:3000 -v "${PWD}/cache:/home/mardock/mardock/.mardock/cache" ghcr.io/hankei6km/mardock_develop:latest
```

キャッシュは `uid=1000` `gid=100` で作成されます。キャッシュファイルのオーナーを変更する場合は、以下のように `uid` と `gid` を指定。

- 参考: [marpteam/marp-cli](https://hub.docker.com/r/marpteam/marp-cli/) の「Troubleshooting」


```
# docker run --rm --init --env-file .env --env "LANG=${LANG}" -p 3000:3000 -v "${PWD}/cache:/home/mardock/mardock/.mardock/cache" -u root --env MARDOCK_USER=<uid:gid> ghcr.io/hankei6km/mardock_develop:latest
```

#### 「雨」等のフォントがおかしい場合

PDF を表示したときに「雨」等の一部フォントがおかしい場合、`$LANG` の指定を明示的に `ja_JP.UTF-8` 等へ変更してみてください。

なお、このときに「キャッシュの永続化」を行っている場合はキャッシュを一旦削除してください。

#### その他

`docker/README.md` に既知の問題等の記述があります。


## ライセンス

MIT License

Copyright (c) 2021 hankei6km



