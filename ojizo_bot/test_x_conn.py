import os
import tweepy
from dotenv import load_dotenv

def test_connectivity():
    print("🔍 Testing X API Connectivity...")
    load_dotenv()
    
    try:
        client = tweepy.Client(
            bearer_token=os.getenv("X_BEARER_TOKEN"),
            consumer_key=os.getenv("X_API_KEY"),
            consumer_secret=os.getenv("X_API_KEY_SECRET"),
            access_token=os.getenv("X_ACCESS_TOKEN"),
            access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET")
        )
        
        me = client.get_me()
        if me.data:
            print(f"✅ Connection Successful!")
            print(f"👤 Authenticated as: @{me.data.username} (ID: {me.data.id})")
            print(f"📝 Bio: {me.data.name}")
        else:
            print("❌ Connection failed: No data returned.")
            
    except Exception as e:
        print(f"❌ Error during connectivity test: {e}")

if __name__ == "__main__":
    test_connectivity()
