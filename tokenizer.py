import pickle
import os

class CharTokenizer:
    """A character-level tokenizer for Japanese, Math, and Philosophical texts."""
    def __init__(self):
        self.stoi = {}
        self.itos = {}
        self.vocab = []
        # Special tokens
        self.pad_token = "[PAD]"
        self.bos_token = "[BOS]"
        self.eos_token = "[EOS]"
        self.unk_token = "[UNK]"
        self.special_tokens = [self.pad_token, self.bos_token, self.eos_token, self.unk_token]

    def build_vocab(self, texts):
        chars = sorted(list(set("".join(texts))))
        self.vocab = self.special_tokens + chars
        self.stoi = {ch: i for i, ch in enumerate(self.vocab)}
        self.itos = {i: ch for i, ch in enumerate(self.vocab)}
        
    def encode(self, text, add_special=True):
        if add_special:
            # Only add if tokens exist in vocab
            bos = self.bos_token if self.bos_token in self.stoi else ""
            eos = self.eos_token if self.eos_token in self.stoi else ""
            text = bos + text + eos
            
        indices = []
        i = 0
        while i < len(text):
            # Check for special tokens first
            found_special = False
            for sp in self.special_tokens:
                if sp in self.stoi and text[i:].startswith(sp):
                    indices.append(self.stoi[sp])
                    i += len(sp)
                    found_special = True
                    break
            if not found_special:
                char = text[i]
                # Default to UNK if not in vocab
                unk_idx = self.stoi.get(self.unk_token, 0)
                indices.append(self.stoi.get(char, unk_idx))
                i += 1
        return indices

    def decode(self, indices):
        return "".join([self.itos.get(idx, self.unk_token) for idx in indices])

    def save(self, path):
        with open(path, 'wb') as f:
            pickle.dump({'stoi': self.stoi, 'itos': self.itos, 'vocab': self.vocab}, f)
            
    def load(self, path):
        if os.path.exists(path):
            with open(path, 'rb') as f:
                data = pickle.load(f)
                self.stoi = data['stoi']
                self.itos = data['itos']
                self.vocab = data['vocab']
                # Ensure special tokens are mapped
                self.stoi.update({sp: i for i, sp in enumerate(self.vocab) if sp in self.special_tokens})
        else:
            print(f"Warning: Tokenizer path {path} not found.")

    @property
    def vocab_size(self):
        return len(self.vocab)

if __name__ == "__main__":
    # Test
    tokenizer = CharTokenizer()
    sample_text = ["如来は智慧なり。1+2=3.", "空即是色、色即是空。"]
    tokenizer.build_vocab(sample_text)
    
    encoded = tokenizer.encode("如来は 1+2=3")
    decoded = tokenizer.decode(encoded)
    
    print(f"Vocab Size: {tokenizer.vocab_size}")
    print(f"Encoded: {encoded}")
    print(f"Decoded: {decoded}")
    print("Tokenizer logic verified.")
