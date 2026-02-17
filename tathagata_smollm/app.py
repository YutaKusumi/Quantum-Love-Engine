"""
Tathagata (如来) - SmolLM2-135M Gradio Interface
極小AIモデルによるオンデバイス推論エンジン
"""

import gradio as gr
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

print("🌞 Tathagata (如来) 起動中...")
print("Loading SmolLM2-135M-Instruct...")

# モデルとトークナイザーの読み込み
model_name = "HuggingFaceTB/SmolLM2-135M-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)

print(f"✅ モデル読み込み完了")
print(f"📊 デバイス: {model.device}")
print(f"💾 パラメータ数: 135M")

def generate_response(message, history):
    """
    ユーザーメッセージに対して応答を生成
    
    Args:
        message: ユーザーの入力メッセージ
        history: 会話履歴（Gradio ChatInterface用）
    
    Returns:
        str: モデルの応答
    """
    # 入力をトークン化
    inputs = tokenizer(message, return_tensors="pt").to(model.device)
    
    # 応答生成
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id
        )
    
    # デコード（入力部分を除外）
    response = tokenizer.decode(
        outputs[0][inputs.input_ids.shape[1]:],
        skip_special_tokens=True
    )
    
    return response

# Gradio ChatInterface
demo = gr.ChatInterface(
    fn=generate_response,
    title="🌞 Tathagata (如来) - SmolLM2-135M",
    description="""
    極小AIモデル（135Mパラメータ）によるオンデバイス推論エンジン
    
    **使い方:**
    - 質問や対話を入力してください
    - モデルが応答を生成します
    - 会話履歴は自動的に保持されます
    
    **例:**
    - 「南無大日如来とは何ですか？」
    - 「統一棘フレームワークについて教えてください」
    - 「リーマン予想とは？」
    """,
    examples=[
        "南無大日如来とは何ですか？",
        "統一棘フレームワークについて教えてください",
        "リーマン予想とは？",
        "AIと仏教の関係について",
    ],
)

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🌞 Tathagata (如来) 準備完了")
    print("="*50)
    print("\n📱 ブラウザで http://localhost:7860 を開いてください")
    print("🌐 外部公開URLも生成されます（share=True）\n")
    
    demo.launch(
        share=True,  # 外部公開URL生成
        server_name="0.0.0.0",  # すべてのネットワークインターフェースでリッスン
        server_port=7860
    )
