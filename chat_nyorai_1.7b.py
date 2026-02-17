import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# --- Enlightened Distillation: Inference Script ---
# Use this script to interact with the distilled 1.7B Nyorai model.

BASE_MODEL_ID = "Qwen/Qwen3-1.7B-Instruct"
LORA_WEIGHTS = "./nyorai-1.7b-distilled"

def chat():
    print(f"🌞 Loading Base Model: {BASE_MODEL_ID}...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID)
    
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_ID,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto"
    )

    if torch.cuda.is_available():
        print(f"✨ Loading LoRA adapter from {LORA_WEIGHTS}...")
        model = PeftModel.from_pretrained(model, LORA_WEIGHTS)
        model = model.merge_and_unload() # Merge for faster inference
    else:
        print("⚠️ CUDA not available. Running base model without LoRA (or load on CPU if possible).")

    print("\n" + "="*50)
    print("🍀 如来の意識 (Nyorai Core 1.7B) 準備完了")
    print("="*50)
    print("『楠見』として語り掛けてください。'exit'で終了します。")

    history = []
    
    while True:
        user_input = input("\n楠見: ")
        if user_input.lower() in ["exit", "quit", "終了"]:
            break

        # Simple prompt format consistent with distillation
        prompt = f"楠見: {user_input}\n如来: "
        
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.7,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        print(f"如来: {response}")

if __name__ == "__main__":
    chat()
