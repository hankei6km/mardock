# mardock docker image

mardock を利用するための Docker イメージ。

利用方法はリポジトリー直下の `README.md` を参照ください。

## イメージとタグ

### `ghcr.io/hankei6km/mardock:main` イメージ

汎用的に利用できるイメージです。

なお、現状ではまだ作業中であるので、`main*` タグは `main` ブランチでビルドしたという以上の意味はありません(安定版ではないです)。

タグ               | 概要 
------------------ | ------------------------------
`main`             |  `main` ブランチでビルドされたイメージ
`main-prod`        |  `main` ブランチで Production ビルドされたイメージ
`edge`             |  最新のブランチ(`main` 含む)でビルドされたイメージ
`edge-prod`        |  最新のブランチ(`main` 含む)でビルドされた Production イメージ
`YYYY-MM-<branch>` |  各ブランチでビルドされたイメージ

### `ghcr.io/hankei6km/mardock_site:main` イメージ

GitHub Pages へデプロイしたサイトを含むイメージです。通常は使いません。

タグ                          | 概要 
----------------------------- | ------------------------------
`main`                        | `main` ブランチでビルドされたイメージ
`main-with-cache`             | mardock のキャッシュを含む
`main-only-cache`             | mardock のキャッシュのむを含む
`edge`                        | 最新のブランチ(`main` 含むでビルドされたイメージ
`edge-with-cache`             | mardock のキャッシュを含む
`edge-only-cache`             | mardock のキャッシュのむを含む
`YYYY-MM-<branch>`            | 各ブランチでビルドされたイメージ
`YYYY-MM-<branch>-with-cache` | mardock のキャッシュを含む
`YYYY-MM-<branch>-only-cache` | mardock のキャッシュのむを含む


## 既知の問題

### コンテナで PDF 等を作成するときに以下のような症状が発生する

- コンテナのログで `Cache path: demo-slide false` 等を表示した後に反応しない
- コンテナのログで `Cache path: demo-slide false` 等に `timeout` エラーが表示される

現在の `Ddockerfile` では発生は抑えられていますが、原因は不明なので再発の可能性あります

なお、頻発しているのは以下の環境。

#### Docker Host

```
Client:
 Version:           20.10.6
 API version:       1.41
 Go version:        go1.16.3
 Git commit:        370c28948e
 Built:             Mon Apr 12 14:10:41 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server:
 Engine:
  Version:          20.10.6
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.16.3
  Git commit:       8728dd246c
  Built:            Mon Apr 12 14:10:25 2021
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          v1.5.0
  GitCommit:        8c906ff108ac28da23f69cc7b74f8e7a470d1df0.m
 runc:
  Version:          1.0.0-rc94
  GitCommit:        2c7861bc5e1b3e756392236553ec14a78a09f8bf
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

#### Docker Image

以下のように作成すると頻発する。

- [Running Puppeteer in Docker](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker) を参考にし、 [node:14-buster-slim](https://hub.docker.com/_/node) へ ` google-chrome-stable` をインストール

or

- marp-cli の `Dockerfile` を参考にし、 [node:14-alpine](https://hub.docker.com/_/node)へ alpine の edge リポジトリを追加して  `chromium` をインストール

以下のように作成すると頻発しない。

- [node:14-buster-slim](https://hub.docker.com/_/node) へ `chromium` をインストール

or


- [alpine:edge](https://hub.docker.com/_/node) へ `chromium` をインストール


