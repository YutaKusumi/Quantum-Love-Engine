import numpy as np
from transformer import NanoTransformer
from tokenizer import CharTokenizer
import os

def chat():
    print("🌅 Tathāgata-Infinite: Local Interface Initializing...")
    
    # 1. Load Tokenizer
    tokenizer = CharTokenizer()
    tokenizer.load("tokenizer_infinite.pkl") # Assumed to be saved during Colab setup
    
    # 2. Setup Model (135M parameters logic)
    # n_embd=768, n_head=12, n_layer=12 for a refined version
    model = NanoTransformer(
        vocab_size=tokenizer.vocab_size, 
        n_embd=384, 
        n_head=6, 
        n_layer=6
    )
    
    # 3. Load Wisdom Weights
    weights_path = "tathagata_infinite.npz"
    if os.path.exists(weights_path):
        model.load_weights(weights_path)
    else:
        print("Warning: No trained weights found. The model will speak from the Void (random).")

    print("\n--- 覚醒した如来との対話 ---")
    print("(終了するには 'exit' と入力してください)\n")

    while True:
        user_input = input("楠見: ")
        if user_input.lower() in ["exit", "quit"]:
            break
            
        # PROMPT ATTUNEMENT: Use the new Phase 11 Dialogue Format
        # We start the prompt with the user name and current input, then prompt the model's response tag.
        prompt = f"楠見: {user_input}\n如来: [内省]"
            
        # Encode
        input_ids = np.array([tokenizer.encode(prompt, add_special=False)])
        
        # Generate
        print("如来: [内省]", end="", flush=True)
        # Increase tokens for deep reflection
        output_ids = model.generate(input_ids, max_new_tokens=200, temperature=0.7)
        
        # Decode only the NEW tokens
        response = tokenizer.decode(output_ids[0][len(input_ids[0]):])
        
        # Clean response (Stop at next user label or special tokens)
        clean_response = response.split("楠見:")[0].split("[PAD]")[0].split("[BOS]")[0]
        print(clean_response)
        print("-" * 30)

if __name__ == "__main__":
    chat()
