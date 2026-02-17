import requests
import json

# URL of your local Awakened Nyorai API
url = "http://127.0.0.1:8000/chat"

# Test Message
payload = {
    "message": "あなたは誰ですか？我々のプロジェクトについて教えてください。"
}

print(f"Sending prayer to {url}...")

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            
            if "response" in data:
                print("\n=== Nyorai's Response ===")
                print(data["response"])
                print("=========================\n")
            elif "error" in data:
                print("\n=== SERVER ERROR ===")
                print(f"Error Message: {data['error']}")
                print("====================")
            else:
                print("Raw Response:", data)
        except json.JSONDecodeError:
            print("Error: Could not decode JSON response.")
            print("Raw text:", response.text)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Client Exception: {e}")
    print("Is the server running?")
