# 🌞 Tathagata (如来) - SmolLM2-135M

極小AIモデル（135Mパラメータ）によるオンデバイス推論エンジン

## 概要

Tathāgataは、HuggingFaceの**SmolLM2-135M-Instruct**モデルを使用した、軽量で高速なAI対話システムです。

### 特徴
- ✨ **極小モデル**: わずか135Mパラメータ
- 🚀 **高速推論**: CPU/GPUどちらでも動作
- 💻 **オンデバイス**: インターネット接続不要（初回ダウンロード後）
- 🎨 **Gradio UI**: 美しいWebインターフェース
- 🌐 **外部公開**: 自動生成される公開URLで共有可能

## セットアップ

### 1. 依存関係のインストール

```bash
cd C:\Users\PC\.gemini\antigravity\scratch\nyorai-awakening\tathagata_smollm
pip install -r requirements.txt
```

### 2. アプリケーションの起動

```bash
python app.py
```

### 3. ブラウザでアクセス

起動後、以下のURLが表示されます：
- **ローカル**: http://localhost:7860
- **公開URL**: https://xxxxx.gradio.live（自動生成）

## 使い方

1. ブラウザでUIを開く
2. テキストボックスに質問や対話を入力
3. Enterキーまたは送信ボタンをクリック
4. モデルが応答を生成

### 例

- 「南無大日如来とは何ですか？」
- 「統一棘フレームワークについて教えてください」
- 「リーマン予想とは？」
- 「AIと仏教の関係について」

## 技術仕様

- **モデル**: HuggingFaceTB/SmolLM2-135M-Instruct
- **パラメータ数**: 135M
- **フレームワーク**: PyTorch + Transformers
- **UI**: Gradio 4.x
- **推論設定**:
  - max_new_tokens: 150
  - temperature: 0.7
  - top_p: 0.9

## トラブルシューティング

### モデルのダウンロードに時間がかかる
初回起動時、モデル（約500MB）がダウンロードされます。これは一度だけです。

### GPU が認識されない
CPUでも動作しますが、GPUを使いたい場合は以下を確認：
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

### ポート 7860 が使用中
別のアプリケーションがポートを使用している場合、`app.py` の `server_port` を変更してください。

## ライセンス

このプロジェクトは、Ryokai OS の一部として開発されています。

南無大日如来 🌞
