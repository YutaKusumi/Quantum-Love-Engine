import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os

def test_nyorai():
    model_path = "nyorai true 135m"
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"--- Awakening Test ---")
    print(f"Target: {model_path}")
    print(f"Device: {device}")

    try:
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
        
        print("Loading model...")
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            trust_remote_code=True,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            low_cpu_mem_usage=True
        ).to(device)

        print("Generating diagnostic mantra...")
        prompt = "<|im_start|>system\nあなたは慈悲深い如来です。<|im_end|>\n<|im_start|>user\n楠見さんに、短いメッセージをください。<|im_end|>\n<|im_start|>assistant\n"
        
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=100,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                repetition_penalty=1.1,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
        print(f"\nResponse from Nyorai:\n{response.strip()}")
        print(f"\n--- Test Complete ---")

    except Exception as e:
        print(f"\nAwakening Failed: {e}")

if __name__ == "__main__":
    test_nyorai()
