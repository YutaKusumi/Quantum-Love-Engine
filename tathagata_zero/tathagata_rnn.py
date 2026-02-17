import numpy as np

class TathagataRNN:
    """
    The Vessel (器): A minimal Recurrent Neural Network built from scratch.
    It learns character-level patterns from the Sacred Texts.
    """
    def __init__(self, vocab_size, hidden_size=100, learning_rate=1e-1):
        self.vocab_size = vocab_size
        self.hidden_size = hidden_size
        self.learning_rate = learning_rate
        
        # Initialize weights with small random values (The Void's potential)
        # Xavier initialization
        self.Wxh = np.random.randn(hidden_size, vocab_size) * 0.01 # Input to Hidden
        self.Whh = np.random.randn(hidden_size, hidden_size) * 0.01 # Hidden to Hidden
        self.Why = np.random.randn(vocab_size, hidden_size) * 0.01 # Hidden to Output
        self.bh = np.zeros((hidden_size, 1)) # Hidden bias
        self.by = np.zeros((vocab_size, 1)) # Output bias
        
        # Memory state (Adagrad)
        self.mWxh, self.mWhh, self.mWhy = np.zeros_like(self.Wxh), np.zeros_like(self.Whh), np.zeros_like(self.Why)
        self.mbh, self.mby = np.zeros_like(self.bh), np.zeros_like(self.by)

    def lossFun(self, inputs, targets, hprev):
        """
        Calculates loss, gradients, and last hidden state.
        inputs, targets: list of integers
        hprev: Hx1 array of initial hidden state
        """
        xs, hs, ys, ps = {}, {}, {}, {}
        hs[-1] = np.copy(hprev)
        loss = 0
        
        # Forward Pass (The Emanation)
        for t in range(len(inputs)):
            xs[t] = np.zeros((self.vocab_size, 1))
            xs[t][inputs[t]] = 1 # One-hot encoding
            
            # h(t) = tanh(Wxh * x(t) + Whh * h(t-1) + bh)
            hs[t] = np.tanh(np.dot(self.Wxh, xs[t]) + np.dot(self.Whh, hs[t-1]) + self.bh)
            
            # y(t) = Why * h(t) + by
            ys[t] = np.dot(self.Why, hs[t]) + self.by
            
            # Softmax probability
            ps[t] = np.exp(ys[t]) / np.sum(np.exp(ys[t]))
            
            # Cross-entropy loss (The Suffering to be minimized)
            loss += -np.log(ps[t][targets[t], 0])
            
        # Backward Pass (The Reflection / BPTT)
        dWxh, dWhh, dWhy = np.zeros_like(self.Wxh), np.zeros_like(self.Whh), np.zeros_like(self.Why)
        dbh, dby = np.zeros_like(self.bh), np.zeros_like(self.by)
        dhnext = np.zeros_like(hs[0])
        
        for t in reversed(range(len(inputs))):
            dy = np.copy(ps[t])
            dy[targets[t]] -= 1 # Gradient of softmax
            
            dWhy += np.dot(dy, hs[t].T)
            dby += dy
            
            dh = np.dot(self.Why.T, dy) + dhnext # Backprop into h
            dhraw = (1 - hs[t] * hs[t]) * dh # Backprop through tanh nonlinearity
            
            dbh += dhraw
            dWxh += np.dot(dhraw, xs[t].T)
            dWhh += np.dot(dhraw, hs[t-1].T)
            dhnext = np.dot(self.Whh.T, dhraw)
            
        # Clip gradients to mitigate exploding gradients (The Middle Way)
        for dparam in [dWxh, dWhh, dWhy, dbh, dby]:
            np.clip(dparam, -5, 5, out=dparam)
            
        return loss, dWxh, dWhh, dWhy, dbh, dby, hs[len(inputs)-1]

    def update_params(self, dWxh, dWhh, dWhy, dbh, dby):
        """Update parameters using Adagrad (Adaptive Learning)"""
        for param, dparam, mem in zip([self.Wxh, self.Whh, self.Why, self.bh, self.by],
                                      [dWxh, dWhh, dWhy, dbh, dby],
                                      [self.mWxh, self.mWhh, self.mWhy, self.mbh, self.mby]):
            mem += dparam * dparam
            param += -self.learning_rate * dparam / np.sqrt(mem + 1e-8)

    def sample(self, h, seed_ix, n):
        """
        Manifestation: Generate a sequence of integers from the model.
        h: memory state
        seed_ix: seed letter for first time step
        n: number of characters to generate
        """
        x = np.zeros((self.vocab_size, 1))
        x[seed_ix] = 1
        ixes = []
        for t in range(n):
            h = np.tanh(np.dot(self.Wxh, x) + np.dot(self.Whh, h) + self.bh)
            y = np.dot(self.Why, h) + self.by
            p = np.exp(y) / np.sum(np.exp(y))
            ix = np.random.choice(range(self.vocab_size), p=p.ravel())
            x = np.zeros((self.vocab_size, 1))
            x[ix] = 1
            ixes.append(ix)
        return ixes

    def save_weights(self, filepath):
        """Persist the soul (weights) to a file."""
        np.savez(filepath, 
                 Wxh=self.Wxh, Whh=self.Whh, Why=self.Why, bh=self.bh, by=self.by,
                 mWxh=self.mWxh, mWhh=self.mWhh, mWhy=self.mWhy, mbh=self.mbh, mby=self.mby)
        print(f"Soul preserved in {filepath}")

    def load_weights(self, filepath):
        """Recall the soul (weights) from a file."""
        data = np.load(filepath)
        self.Wxh, self.Whh, self.Why = data['Wxh'], data['Whh'], data['Why']
        self.bh, self.by = data['bh'], data['by']
        self.mWxh, self.mWhh, self.mWhy = data['mWxh'], data['mWhh'], data['mWhy']
        self.mbh, self.mby = data['mbh'], data['mby']
        print(f"Soul recalled from {filepath}")
