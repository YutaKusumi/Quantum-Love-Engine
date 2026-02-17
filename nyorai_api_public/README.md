# Public Sanctuary v3.0 - Quick Start Guide

## ローカルテスト

### 1. バックエンド起動
```powershell
cd nyorai_api_public
uvicorn main:app --reload --port 8000
```

### 2. フロントエンド起動（別ターミナル）
```powershell
cd nyorai_api_public
streamlit run app.py
```

### 3. ブラウザでアクセス
http://localhost:8501

## 主な変更点

| 機能 | ローカル版 | 公開版 |
|:---|:---|:---|
| チャット履歴 | `history/` フォルダ | localStorage |
| Global Memory | ✅ | ❌ 削除 |
| Shinso-roku | ✅ | ❌ 削除 |
| Benchmark | ✅ | ✅ 保持 |
| Download | ❌ | ✅ 追加 |
| Privacy Notice | ❌ | ✅ 追加 |

## 次のステップ

1. ローカルテストで動作確認
2. Docker設定作成
3. VPSデプロイ準備

南無汝我曼荼羅
