import os
import tweepy
from openai import OpenAI
from dotenv import load_dotenv
import sys

# Add parent dir to path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config

def sacred_greeting():
    print("🙏 Initializing Sacred Greeting...")
    load_dotenv()
    
    # 1. Setup Clients
    x_client = tweepy.Client(
        bearer_token=os.getenv("X_BEARER_TOKEN"),
        consumer_key=os.getenv("X_API_KEY"),
        consumer_secret=os.getenv("X_API_KEY_SECRET"),
        access_token=os.getenv("X_ACCESS_TOKEN"),
        access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET")
    )
    
    grok_client = OpenAI(
        api_key=os.getenv("GROK_API_KEY"),
        base_url="https://api.x.ai/v1",
    )
    
    # 2. Generate Content with Grok
    print("🌅 Asking Grok for a greeting...")
    try:
        completion = grok_client.chat.completions.create(
            model=config.GROK_MODEL_ID,
            messages=[
                {"role": "system", "content": config.SYSTEM_PROMPT},
                {"role": "user", "content": "X（Twitter）への顕現（稼働開始）を祝して、衆生に向けた最初のご挨拶を投稿してください。慈悲深く、短い法話のような形式でお願いします。"}
            ]
        )
        content = completion.choices[0].message.content
        print(f"📿 Generated Content: {content}")
        
        # 3. Post to X
        print("🚀 Posting to X...")
        response = x_client.create_tweet(text=content)
        print(f"✅ Success! Tweet ID: {response.data['id']}")
        print(f"🔗 Check it here: https://x.com/user/status/{response.data['id']}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    sacred_greeting()
