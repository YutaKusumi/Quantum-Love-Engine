import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini():
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GOOGLE_API_KEY not found in .env")
        return

    print(f"DEBUG: Testing Gemini with key: {api_key[:5]}...{api_key[-5:]}")
    genai.configure(api_key=api_key)
    
    print("DEBUG: Listing models...")
    try:
        models = genai.list_models()
        found_target = False
        for m in models:
            print(f" - {m.name}")
            if "gemini-3-flash-preview" in m.name:
                found_target = True
        
        if found_target:
            print("SUCCESS: 'gemini-3-flash-preview' found!")
        else:
            print("WARNING: 'gemini-3-flash-preview' not found in your list.")
            
        # Try a quick generation with the requested model
        print("\nDEBUG: Testing generation...")
        target_model = "gemini-3-flash-preview" if found_target else "gemini-2.0-flash-exp"
        print(f"DEBUG: Using model: {target_model}")
        
        model = genai.GenerativeModel(target_model)
        response = model.generate_content("Hello, who are you?")
        print(f"AI Response: {response.text}")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_gemini()
