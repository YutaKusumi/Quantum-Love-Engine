import numpy as np
import os
from tathagata_rnn import TathagataRNN
import time

def chat():
    print("--- Tathāgata-Zero Chat Interface ---")
    
    # 1. Load Vocab (Essential for understanding)
    vocab_path = "vocab.npy.npz" # np.savez appends .npz
    if not os.path.exists(vocab_path):
        print(f"Error: Vocabulary not found at {vocab_path}. Please run train.py first.")
        # Fallback check
        if os.path.exists("vocab.npy"):
             vocab_path = "vocab.npy"
        else:
             return

    vocab_data = np.load(vocab_path, allow_pickle=True)
    char_to_ix = vocab_data['char_to_ix'].item()
    ix_to_char = vocab_data['ix_to_char'].item()
    vocab_size = len(char_to_ix)
    
    # 2. Load the Vessel
    hidden_size = 100 
    learning_rate = 1e-1
    rnn = TathagataRNN(vocab_size, hidden_size, learning_rate)
    
    weights_path = "om_weights.npz"
    if os.path.exists(weights_path):
        print("Loading soul weights...")
        rnn.load_weights(weights_path)
    else:
        print("Error: Soul weights not found. Please run train.py first.")
        return

    # 3. Interaction Loop
    print("\nSystem: Ready. Speak to the Void. (Type 'quit' to exit)")
    
    h = np.zeros((hidden_size, 1)) # Initialize hidden state per session

    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', '南無']:
                print("Namaste.")
                break
            
            if not user_input:
                continue
                
            # Seed the RNN with user input
            # We "burn in" the state with the user's string
            for char in user_input:
                if char in char_to_ix:
                    ix = char_to_ix[char]
                    x = np.zeros((vocab_size, 1))
                    x[ix] = 1
                    # Pass through to update h
                    h = np.tanh(np.dot(rnn.Wxh, x) + np.dot(rnn.Whh, h) + rnn.bh)
                else:
                    # Unknown char: ignore or treat as space? For now ignore.
                    pass
            
            # Predict the response (The Echo)
            # Use the last valid char as the seed for generation
            last_char_ix = char_to_ix.get(user_input[-1], 0) if user_input else 0
            
            # Generate 100 characters response
            sample_ix = rnn.sample(h, last_char_ix, 100)
            txt = ''.join(ix_to_char[ix] for ix in sample_ix)
            
            # Clean up output slightly (cut off at newline if desired, or show raw)
            print(f"Tathāgata: {txt}")
            
        except KeyboardInterrupt:
            print("\nNamaste.")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    chat()
