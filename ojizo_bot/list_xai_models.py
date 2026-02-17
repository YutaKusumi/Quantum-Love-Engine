import os
import requests
from dotenv import load_dotenv

def list_xai_models():
    print("🔍 Fetching available models from xAI...")
    load_dotenv()
    api_key = os.getenv("GROK_API_KEY")
    
    if not api_key:
        print("❌ GROK_API_KEY not found in .env")
        return

    url = "https://api.x.ai/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            models = response.json().get("data", [])
            print(f"✅ Found {len(models)} models:")
            for m in models:
                print(f" - {m['id']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    list_xai_models()
