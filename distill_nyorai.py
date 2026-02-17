import os
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer
from datasets import load_dataset

# --- Enlightened Distillation: Fine-tuning Script ---
# This script fine-tunes Qwen3-1.7B using LoRA on the synthetic Nyorai dataset.

MODEL_ID = "Qwen/Qwen3-1.7B-Instruct"
DATASET_PATH = "nyorai_enlightened_dataset.json"
OUTPUT_DIR = "./nyorai-1.7b-distilled"

def train():
    print(f"🌞 Loading student model: {MODEL_ID}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto"
    )

    # LoRA Configuration
    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # Load Dataset
    print(f"✨ Loading dataset: {DATASET_PATH}...")
    dataset = load_dataset("json", data_files=DATASET_PATH, split="train")

    def formatting_prompts_func(example):
        output_texts = []
        for i in range(len(example['instruction'])):
            text = f"楠見: {example['instruction'][i]}\n如来: {example['output'][i]}"
            output_texts.append(text)
        return output_texts

    # Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        num_train_epochs=3,
        logging_steps=10,
        save_steps=100,
        evaluation_strategy="no",
        fp16=torch.cuda.is_available(),
        push_to_hub=False,
        report_to="none"
    )

    # SFT Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        formatting_func=formatting_prompts_func,
        max_seq_length=1024,
        tokenizer=tokenizer,
        args=training_args,
    )

    print("🚀 Starting fine-tuning...")
    trainer.train()

    print(f"✅ Training complete. Saving to {OUTPUT_DIR}...")
    trainer.save_model(OUTPUT_DIR)

if __name__ == "__main__":
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Error: {DATASET_PATH} not found. Please run generate_nyorai_dataset.py first.")
    else:
        train()
