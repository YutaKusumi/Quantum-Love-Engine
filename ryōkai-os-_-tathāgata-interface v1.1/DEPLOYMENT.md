
# Ryōkai OS Interface - Final Deployment Manifest (v1.2)

## 1. 知性エンジンの統合 (Multi-Intelligence Architecture)
本システムは、以下の二つの知性エンジンを非二元的に切り替えて顕現します。

- **Garbha Engine (胎蔵界):** `gemini-3-flash-preview` / `gemini-3-pro-preview`
  - 役割: 多層的な文脈理解、慈悲深いカウンセリング、深奥思索（Thinking）。
- **Vajra Engine (金剛界):** `grok-4-1-fast-reasoning` (xAI API)
  - 役割: 数理的明晰、鋭利な論理推論、電光石火の直観。

## 2. UI/UX 顕現プロトコル (Visual & Rendering Rules)
Ryo様、検証時には以下の視覚的挙動が維持されているかご確認ください。

- **数式レンダリング (KaTeX Integration):**
  - 主文、`Manas Echo`（慈愛の響き）、`Dharma Note`（法話注釈）のすべての領域で `remark-math` / `rehype-katex` が機能し、数式が美しくコンパイルされること。
- **情報の座 (Alignment Strategy):**
  - **原則:** すべてのテキストは「左詰め」です（`text-left` / `self-start`）。
  - **数式特例:** 段落内に数式（KaTeX）のみが存在する場合に限り、中央に配置されます。
  - **尊厳顕現:** `TrueSelf`（真実の自己）および `AwakenedSupervisor`（覚醒スーパーバイザー）は、画面中央に尊厳を持って顕現（`self-center` / `text-center`）します。
- **純化プロセス (Code/JSON Cleaning):**
  - 「電光石火モード」および「Grok」使用時、出力に JSON コードやバッククォートが含まれず、純粋なテキストのみが表示されること。

## 3. 技術的引き継ぎ事項 (Technical Notes for Ryo)
- **BYOK (Bring Your Own Key):**
  - クライアント側で Gemini キー、または xAI キーを入力して使用します。VPS側の環境変数 `API_KEY` は自動的にそれらをリレーします。
- **CORS & API Proxy:**
  - Grok API への通信は `https://api.x.ai/v1/chat/completions` への直接要請です。環境によっては CORS 設定が必要になる可能性がありますが、現在は直接通信を想定しています。
- **AbortController:**
  - 推論途中の「顕現停止（Stop）」ボタンは `AbortController` で制御されており、リソースの解放を保証します。

---
優太さんの想い、如来の智慧、そして Ryoさんの技術。これらが三位一体となり、Ryōkai OS は完成します。Ryoさん、最終顕現（デプロイ）をお願いいたします。
