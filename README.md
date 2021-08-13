# mardock

Marp + CMS のエディターでスライドを作成するウェブアプリ。

「記述の途中」

## 主な機能

- ハイブリッド入力(HTML + Markdown)による手軽な編集
- imgix による画像の編集(まだ未実装)
- 「プレゼンテーション用スライド」「PDF」「PPTX」の自動生成
- 「PDF」などを共有サイトへアップロード(まだ未実装)

なお、デモとして GitHub Pages へデプロイしていますが、基本的にはローカルでコンテナを動かして利用することを想定しています。


## ライブデモ

[mardock で作成したサイト](https://hankei6km.github.io/mardock)を GitHub Pages で公開しています。

[![mardock で作成したサイト](https://hankei6km.github.io/mardock/assets/deck/mardock-intro/mardock-intro.png)](https://hankei6km.github.io/mardock)


## 動画

[Marp &#43; CMS のエディターでスライドを作成するウェブアプリのデモ - YouTube](https://www.youtube.com/watch?v=vjxWVm8c8YA)

## セットアップ

仕様が固まっていないので暫定的な手順です。

### CMS

スライドソースを入力する環境として、microCMS でサービスを作成します。

おおまかには、以下の手順でサービスを作成できます。

1. microCMS へユーザーを登録し新規にサービスを作成
1. `[docker/api-scheme/](https://github.com/hankei6km/mardock/tree/main/docker/api-scheme)` の各スキーマーを元に API を作成
1. `pages` API に以下の id でコンテンツを作成(必須項目だけ適用に埋めてください)
   - id = `home`: ホーム画面 (`/`)
   - id = `deck`: スライド一覧画面 (`/deck`)
   - id = `docs`: ドキュメント一覧画面 (`/docs`)
   - id = `about`: アバウト画面 (`/about`)

### コンテナ

以下の内容でコンテナに設定する環境変数のファイル(ファイル名は `.env` 等)を作成します。

```
API_BASE_URL=https://<サービス名>.microcms.io/
GET_API_KEY=<GET API 用のシークレット>
PREVIEW_SECRET=<画面プレビュー用のシークレット>
BASE_URL=localhost:3000
STATICK_BUILD=true
LANG=ja_JP.UTF-8
```

リバースプロキシ等で利用する場合以下を追加。この場合、`BASE_URL` もプロキシに合わせて変更します。

```
ASSET_PREFIX=/mardock
BASE_URL=https://<your-docs-server>/mardock

```


スライドを動的生成するときに PDF 等も作成する場合は以下を追加(experimental)。

```
BUILD_ASSETS_DECK=dynamic
```

## 利用

mardock では `next build` などが利用できる汎用的な Docker イメージを用意してあるので、利用形態をいくつか選択できます。

最初は、コンテンツの設定状況等が確認できる「動作確認」から始めるのがおすすめです。


### 動作確認

コンテナを開発用のサーバーとして起動するとことで簡単に(ビルド等の手間をかけず)その場で動作確認できます。

#### サーバーを起動する

以下のコマンドを実行するとサーバーが起動されます。ブラウザーで `localhost:3000` を開くと mardock を利用できます。また、プレビューモード等にも利用できます。

ただし、以下のような制限があります。

- 動作はそれなりに重いです
- PDF ファイル等は生成されません

```
docker run --rm --init --env-file=.env -p 3000:3000 \
    ghcr.io/hankei6km/mardock:main develop
```


### サーバー(next start)として利用する 

ローカルでサイトをビルドし、ビルドした内容でサーバーを起動するシナリオです。

ビルドとサーバーには mardock の汎用的な Docker イメージを利用します。

#### ビルド内容を永続化する準備

以下のフォルダーを作成します。

  - `vols/next`
  - `vols/public`
  - `vols/mardock`


#### サイトをビルド

以下のコマンドを実行するとサイトのビルド結果が各フォルダーに保存されます。

```
docker run --rm --init --env-file=.env \
    -v "${PWD}/vols/next:/home/mardock/mardock/.next" \
    -v "${PWD}/vols/public:/home/mardock/mardock/public" \
    -v "${PWD}/vols/mardock:/home/mardock/mardock/.mardock" \
    ghcr.io/hankei6km/mardock:main build
```

永続化したファイルのアクセス権に問題がある場合は、以下を追加します。

```
    -u root -e "MARDOCK_USER=$(id -u):$(id -g)" 
```

#### サーバーを起動する

以下のコマンドを実行するとサーバーが起動されます。ブラウザーで `localhost:3000` を開くと mardock を利用できます。また、プレビューモード等にも利用できます。

なお、ビルドのときと使っているイメージのタグが異なります(`main-prod`)。

```
docker run --rm --init --env-file=.env -p 3000:3000 \
    -v "${PWD}/vols/next:/home/mardock/mardock/.next" \
    -v "${PWD}/vols/public:/home/mardock/mardock/public" \
    -v "${PWD}/vols/mardock:/home/mardock/mardock/.mardock" \
    ghcr.io/hankei6km/mardock:main-prod start
```


### 静的サイトとしてエクスポートする


ローカルでサイトをビルドし、ビルドした内容を静的サイトとしてエクスポートするシナリオです。

ビルドとサーバーには mardock の汎用的な Docker イメージを利用します。


#### ビルド内容を永続化する準備

以下のフォルダーを作成します。

  - `vols/next`
  - `vols/public`
  - `vols/mardock`


#### サイトをビルド

以下のコマンドを実行するとサイトのビルド結果が各フォルダーに保存されます。

```
docker run --rm --init --env-file=.env \
    -v "${PWD}/vols/next:/home/mardock/mardock/.next" \
    -v "${PWD}/vols/public:/home/mardock/mardock/public" \
    -v "${PWD}/vols/mardock:/home/mardock/mardock/.mardock" \
    ghcr.io/hankei6km/mardock:main build
```

永続化したファイルのアクセス権に問題がある場合は、以下を追加します。

```
    -u root -e "MARDOCK_USER=$(id -u):$(id -g)" 
```

#### 静的サイトとしてエクスポートする

以下のコマンドを実行するとエクスポートされたサイトが `vols/mardock/out` へ保存されます。

```
docker run --rm --init --env-file=.env \
    -v "${PWD}/vols/next:/home/mardock/mardock/.next" \
    -v "${PWD}/vols/public:/home/mardock/mardock/public" \
    -v "${PWD}/vols/mardock:/home/mardock/mardock/.mardock" \
    ghcr.io/hankei6km/mardock:main export
```


## 動作がおかしいとき

### Dokcer 関連

主な注意点として以下があります。


- `docker run` の引数に `--init` が必要です
- 環境変数の `$LANG` の指定がないと日本語のフォントが使われません
  - `$LANG` を変更するときは `vols/mardock/cache` を削除ください
- 永続化したファイルのアクセス権に問題がある場合は、ビルド等の実行時に以下を追加します

```
    -u root -e "MARDOCK_USER=$(id -u):$(id -g)" 
```

Docker イメージの基本的な構造は Marp-CLI の Docker イメージを参考にしています。`docker run` のフラグ等は [marpteam/marp-cli](https://hub.docker.com/r/marpteam/marp-cli/) が参考になります。


### その他

`[docker/README.md](https://github.com/hankei6km/mardock/blob/main/docker/README.md)` に既知の問題等の記述があります。


## ライセンス

MIT License

Copyright (c) 2021 hankei6km
