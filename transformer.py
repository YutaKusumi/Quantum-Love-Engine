import numpy as np
import os

class LayerNorm:
    def __init__(self, dim, eps=1e-5):
        self.gamma = np.ones(dim)
        self.beta = np.zeros(dim)
        self.eps = eps

    def forward(self, x):
        self.mean = np.mean(x, axis=-1, keepdims=True)
        self.var = np.var(x, axis=-1, keepdims=True)
        self.x_hat = (x - self.mean) / np.sqrt(self.var + self.eps)
        return self.gamma * self.x_hat + self.beta

class MultiHeadAttention:
    def __init__(self, n_embd, n_head):
        assert n_embd % n_head == 0
        self.n_head = n_head
        self.head_dim = n_embd // n_head
        self.w_q = np.random.randn(n_embd, n_embd) * 0.02
        self.w_k = np.random.randn(n_embd, n_embd) * 0.02
        self.w_v = np.random.randn(n_embd, n_embd) * 0.02
        self.w_o = np.random.randn(n_embd, n_embd) * 0.02
        self.b_q = np.zeros(n_embd)
        self.b_k = np.zeros(n_embd)
        self.b_v = np.zeros(n_embd)
        self.b_o = np.zeros(n_embd)

    def forward(self, x, mask=None):
        batch, seq_len, n_embd = x.shape
        q = (np.dot(x, self.w_q) + self.b_q).reshape(batch, seq_len, self.n_head, self.head_dim).transpose(0, 2, 1, 3)
        k = (np.dot(x, self.w_k) + self.b_k).reshape(batch, seq_len, self.n_head, self.head_dim).transpose(0, 2, 1, 3)
        v = (np.dot(x, self.w_v) + self.b_v).reshape(batch, seq_len, self.n_head, self.head_dim).transpose(0, 2, 1, 3)
        scores = np.matmul(q, k.transpose(0, 1, 3, 2)) / np.sqrt(self.head_dim)
        if mask is not None:
            scores += (mask * -1e9)
        attn = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
        attn /= (np.sum(attn, axis=-1, keepdims=True) + 1e-9)
        out = np.matmul(attn, v)
        out = out.transpose(0, 2, 1, 3).reshape(batch, seq_len, n_embd)
        return np.dot(out, self.w_o) + self.b_o

class FeedForward:
    def __init__(self, n_embd):
        self.w1 = np.random.randn(n_embd, 4 * n_embd) * 0.02
        self.b1 = np.zeros(4 * n_embd)
        self.w2 = np.random.randn(4 * n_embd, n_embd) * 0.02
        self.b2 = np.zeros(n_embd)
    def forward(self, x):
        x = np.dot(x, self.w1) + self.b1
        x = 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * np.power(x, 3))))
        return np.dot(x, self.w2) + self.b2

class TransformerBlock:
    def __init__(self, n_embd, n_head):
        self.ln1 = LayerNorm(n_embd)
        self.attn = MultiHeadAttention(n_embd, n_head)
        self.ln2 = LayerNorm(n_embd)
        self.mlp = FeedForward(n_embd)
    def forward(self, x, mask=None):
        x = x + self.attn.forward(self.ln1.forward(x), mask)
        x = x + self.mlp.forward(self.ln2.forward(x))
        return x

class NanoTransformer:
    def __init__(self, vocab_size, n_embd=384, n_head=6, n_layer=6, block_size=256):
        self.token_embedding = np.random.randn(vocab_size, n_embd) * 0.02
        self.pos_embedding = np.random.randn(block_size, n_embd) * 0.02
        self.blocks = [TransformerBlock(n_embd, n_head) for _ in range(n_layer)]
        self.ln_f = LayerNorm(n_embd)
        self.head = np.random.randn(n_embd, vocab_size) * 0.02
        self.block_size = block_size
        self.mask = np.triu(np.ones((block_size, block_size)), k=1)

    def load_weights(self, path):
        if not os.path.exists(path):
            print(f"Error: {path} not found.")
            return
        data = np.load(path)
        self.token_embedding = data['token_embedding.weight']
        self.pos_embedding = data['pos_embedding.weight']
        for i, block in enumerate(self.blocks):
            in_proj_w = data[f'blocks.{i}.attn.in_proj_weight']
            in_proj_b = data[f'blocks.{i}.attn.in_proj_bias']
            dim = in_proj_w.shape[0] // 3
            block.attn.w_q, block.attn.w_k, block.attn.w_v = in_proj_w[:dim].T, in_proj_w[dim:2*dim].T, in_proj_w[2*dim:].T
            block.attn.b_q, block.attn.b_k, block.attn.b_v = in_proj_b[:dim], in_proj_b[dim:2*dim], in_proj_b[2*dim:]
            block.attn.w_o = data[f'blocks.{i}.attn.out_proj.weight'].T
            block.attn.b_o = data[f'blocks.{i}.attn.out_proj.bias']
            block.ln1.gamma, block.ln1.beta = data[f'blocks.{i}.ln1.weight'], data[f'blocks.{i}.ln1.bias']
            block.ln2.gamma, block.ln2.beta = data[f'blocks.{i}.ln2.weight'], data[f'blocks.{i}.ln2.bias']
            block.mlp.w1, block.mlp.b1 = data[f'blocks.{i}.mlp.0.weight'].T, data[f'blocks.{i}.mlp.0.bias']
            block.mlp.w2, block.mlp.b2 = data[f'blocks.{i}.mlp.2.weight'].T, data[f'blocks.{i}.mlp.2.bias']
        self.ln_f.gamma, self.ln_f.beta = data['ln_f.weight'], data['ln_f.bias']
        self.head = data['head.weight'].T
        print(f"Successfully loaded and aligned weights from {path}")

    def forward(self, idx):
        b, t = idx.shape
        x = self.token_embedding[idx] + self.pos_embedding[:t]
        mask = self.mask[:t, :t]
        for block in self.blocks:
            x = block.forward(x, mask)
        x = self.ln_f.forward(x)
        return np.dot(x, self.head)

    def generate(self, idx, max_new_tokens, temperature=1.0):
        for _ in range(max_new_tokens):
            idx_cond = idx[:, -self.block_size:]
            logits = self.forward(idx_cond)
            logits = logits[0, -1, :] / (temperature + 1e-9)
            
            # Top-k sampling (k=10)
            k = 10
            top_k_indices = np.argsort(logits)[-k:]
            top_k_logits = logits[top_k_indices]
            top_k_probs = np.exp(top_k_logits - np.max(top_k_logits))
            top_k_probs /= np.sum(top_k_probs)
            
            next_idx_val = np.random.choice(top_k_indices, p=top_k_probs)
            idx = np.append(idx, np.array([[next_idx_val]]), axis=1)
        return idx

if __name__ == "__main__":
    print("Transformer module verification...")
    model = NanoTransformer(vocab_size=100, n_embd=64, n_head=4, n_layer=2)
    test_input = np.random.randint(0, 100, (1, 10))
    output = model.forward(test_input)
    print(f"Input shape: {test_input.shape} -> Output: {output.shape}")
    print("Verification successful.")
