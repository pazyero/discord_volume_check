# discord_stream_bot

## 概要

`discord_stream_bot` は、Discord 上で 2 つの BOT を使い、音声を中継するシステムです。  
BOT1 が音声を取得し、BOT2 がその音声を出力します。

---

## 必要環境

- Node.js（推奨バージョン: 18.13.0）  
- npm（推奨バージョン: 8.19.3）  
- discord.js（バージョン 14.7.1）  

---

## セットアップ手順

1. Discord Developer Portal で 2 つの BOT を作成し、それぞれのクライアント ID とトークンを取得してください。  
2. リポジトリをクローンしてディレクトリに移動します。  
   ```bash
   git clone https://github.com/pazyero/discord_stream_bot.git
   cd discord_stream_bot
3. 依存パッケージをインストールします。
   npm install
4. config.json ファイルを開き、BOT のクライアント ID とトークンを設定してください。

---

## コマンドのデプロイ

以下のコマンドを実行して、Discord サーバーにスラッシュコマンドを登録します。

node deploy-commands.js

---

## BOT の起動

以下のコマンドで BOT を起動します。

node index.js

---

## 利用可能なコマンド一覧

コマンド                     説明
* `/ban` user                   指定したユーザーの音声を中継しないようにする
* `/dc`                         ボイスチャンネルから BOT を切断する
* `/stop`                       音声の中継を停止する
* `/join` `channel1` `channel2`     channel1 にリスナー BOT を、channel2 にスピーカー BOT を参加させる
* `/ping`                       BOT の応答確認を行う
* `/restart`                    音声の中継を一回終了し、再開させる
* `/start`                      音声の中継を開始する
* `/stream` `channel1` `channel2`   channel1 にリスナー BOT を、channel2 にスピーカー BOT を参加させ音声の中継を開始する
* `/volum` `user` `volume`          指定したユーザーの音量を調整する

---

注意事項

- BOT には、対象ボイスチャンネルへの接続権限や発話権限が必要です。
- ネットワーク環境によっては音声遅延が発生する可能性があります。

---

ライセンス

このプロジェクトは MIT ライセンスのもとで公開されています。
詳細は LICENSE ファイルをご参照ください。
