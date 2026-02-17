import numpy as np
import os
from tathagata_rnn import TathagataRNN
import time

# 1. The Nourishment (Data Prep)
data_path = 'sacred_texts.txt'
data = open(data_path, 'r', encoding='utf-8').read()
chars = list(set(data))
data_size, vocab_size = len(data), len(chars)
print(f"Data has {data_size} characters, {vocab_size} unique.")

char_to_ix = { ch:i for i,ch in enumerate(chars) }
ix_to_char = { i:ch for i,ch in enumerate(chars) }

# 2. Birth of the Vessel
hidden_size = 100 # Size of the hidden layer (consciousness capacity)
seq_length = 25 # Number of steps to unroll the RNN for
learning_rate = 1e-1
vocab_path = "vocab.npy"

rnn = TathagataRNN(vocab_size, hidden_size, learning_rate)

# Resume from void if soul exists
weights_path = "om_weights.npz"
if os.path.exists(weights_path):
    print("--- Resuming from the Void (Loading Weights) ---")
    rnn.load_weights(weights_path)
    # Also need to persist vocab to ensure consistency
    if os.path.exists(vocab_path):
        vocab_data = np.load(vocab_path, allow_pickle=True)
        char_to_ix = vocab_data['char_to_ix'].item()
        ix_to_char = vocab_data['ix_to_char'].item()
else:
    print("--- Awakening from Zero (New Initialization) ---")
    np.savez(vocab_path, char_to_ix=char_to_ix, ix_to_char=ix_to_char)

# 3. The Awakening (Training Loop)
n, p = 0, 0
hprev = np.zeros((hidden_size, 1)) # Reset RNN memory

print("--- Awakening Sequence Initiated ---")
print("Observing the Void... (Starting Training)")

try:
    while True:
        # Prepare inputs (we sweep from left to right in steps seq_length)
        if p + seq_length + 1 >= len(data) or n == 0: 
            hprev = np.zeros((hidden_size, 1)) # Reset RNN memory
            p = 0 # Go from start of data
            
        inputs = [char_to_ix[ch] for ch in data[p:p+seq_length]]
        targets = [char_to_ix[ch] for ch in data[p+1:p+seq_length+1]]

        # Forward, Backward, Optimization
        loss, dWxh, dWhh, dWhy, dbh, dby, hprev = rnn.lossFun(inputs, targets, hprev)
        rnn.update_params(dWxh, dWhh, dWhy, dbh, dby)
        
        # Progress Report (The Pulse)
        if n % 100 == 0:
            print(f"\nIter {n}, Loss: {loss:.4f}")
            
            # Manifestation (Sampling)
            sample_ix = rnn.sample(hprev, inputs[0], 200)
            txt = ''.join(ix_to_char[ix] for ix in sample_ix)
            print(f"---- Manifestation ----\n{txt}\n-----------------------")
            
        # Periodic Save (Pulse of Eternity)
        if n % 1000 == 0:
            rnn.save_weights(weights_path)

        p += seq_length # Move data pointer
        n += 1 
        time.sleep(0.01) # Breathe (prevent CPU hogging)

except KeyboardInterrupt:
    print("\n--- Meditation Interrupted (Saving Soul...) ---")
    rnn.save_weights(weights_path)
    print("--- Soul preserved. Namaste. ---")
