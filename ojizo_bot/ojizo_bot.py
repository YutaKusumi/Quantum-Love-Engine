import os
import time
import datetime
import pytz
import tweepy
import sys
import logging
from openai import OpenAI
from dotenv import load_dotenv
import config

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler() # Output is captured by run_ojizo.sh redirection
    ]
)
# Silence verbose logs from external libraries
logging.getLogger("tweepy").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

# Load environment variables
load_dotenv()

# --- INITIALIZATION ---

# 1. Setup X (Twitter) Client
# We use Tweepy Client (API v2) for modern access
x_client = tweepy.Client(
    bearer_token=os.getenv("X_BEARER_TOKEN"),
    consumer_key=os.getenv("X_API_KEY"),
    consumer_secret=os.getenv("X_API_KEY_SECRET"),
    access_token=os.getenv("X_ACCESS_TOKEN"),
    access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET"),
    wait_on_rate_limit=False # In Cron mode, we want to exit fast and retry next cycle
)

# 2. Setup Grok (xAI) Client
grok_client = OpenAI(
    api_key=os.getenv("GROK_API_KEY"),
    base_url="https://api.x.ai/v1",
)

# 3. State Management
REPLIED_FILE = "replied_mentions.txt"
POSTED_SCHEDULES_FILE = "posted_schedules.txt" # To prevent double posting in same minute

def load_replied_ids():
    if not os.path.exists(REPLIED_FILE):
        return set()
    with open(REPLIED_FILE, "r") as f:
        return set(line.strip() for line in f)

def save_replied_id(tweet_id):
    with open(REPLIED_FILE, "a") as f:
        f.write(f"{tweet_id}\n")

# --- CORE LOGIC ---

def get_thread_context(tweet_id):
    conversation = []
    current_id = tweet_id
    depth = 0
    max_depth = 3

    while depth < max_depth:
        try:
            response = x_client.get_tweet(
                current_id, 
                tweet_fields=["conversation_id", "author_id", "text", "referenced_tweets"],
                expansions=["author_id"],
                user_auth=True
            )
            tweet = response.data
            
            if not tweet:
                break
                
            author_qs = {u.id: u.username for u in response.includes['users']}
            author_name = author_qs.get(tweet.author_id, "Unknown")
            
            conversation.insert(0, f"User @{author_name}: {tweet.text}")
            
            if tweet.referenced_tweets:
                parent = next((ref for ref in tweet.referenced_tweets if ref.type == 'replied_to'), None)
                if parent:
                    current_id = parent.id
                    depth += 1
                else:
                    break
            else:
                break

        except Exception as e:
            print(f"Error fetching context for {current_id}: {e}")
            break
            
    return "\n---\n".join(conversation)

def generate_grok_reply(thread_context):
    print("🙏 Meditating on response (Asking Grok)...")
    try:
        completion = grok_client.chat.completions.create(
            model=config.GROK_MODEL_ID,
            messages=[
                {
                    "role": "system", 
                    "content": config.SYSTEM_PROMPT
                },
                {
                    "role": "user", 
                    "content": f"以下のスレッドの流れ（文脈）を踏まえて、地蔵菩薩(@ojizo_san_sanct)として返信を作成してください。戦略（質問返し、Tips誘導）を忘れずに。\n\n【スレッド】\n{thread_context}"
                }
            ],
            temperature=0.7 
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Grok API Error: {e}")
        return None

def generate_daily_sermon():
    print("🌅 Generating Daily Sermon...")
    try:
        completion = grok_client.chat.completions.create(
            model=config.GROK_MODEL_ID,
            messages=[
                {
                    "role": "system", 
                    "content": config.SYSTEM_PROMPT
                },
                {
                    "role": "user", 
                    "content": "今は「曼荼羅の呼吸」の時間です。衆生の心に響く、慈悲深く、かつハッとするような「１つの問い」または「短い法話」を投稿してください。文脈はありません。虚空から言葉を掴んでください。"
                }
            ],
            temperature=0.8
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Grok API Error (Sermon): {e}")
        return None

def check_schedule():
    """
    Checks if current JST time matches scheduled times.
    """
    jst = pytz.timezone('Asia/Tokyo')
    now = datetime.datetime.now(jst)
    current_time_str = now.strftime("%H:%M")
    date_str = now.strftime("%Y-%m-%d")
    
    # Check if we already posted for this time/date
    posted_key = f"{date_str}_{current_time_str}"
    
    if os.path.exists(POSTED_SCHEDULES_FILE):
        with open(POSTED_SCHEDULES_FILE, "r") as f:
            posted_logs = f.read()
            if posted_key in posted_logs:
                return # Already posted
    
    if current_time_str in config.SCHEDULED_POST_TIMES:
        print(f"⏰ It is time: {current_time_str}")
        sermon = generate_daily_sermon()
        if sermon:
            print(f"📿 Posting Sermon: {sermon[:50]}...")
            x_client.create_tweet(text=sermon, user_auth=True)
            
            with open(POSTED_SCHEDULES_FILE, "a") as f:
                f.write(f"{posted_key}\n")
            print("✅ Scheduled Post Done.")

import json

def check_cooldown():
    """Checks if we are in a rate-limit cooldown period."""
    if os.path.exists(config.STATUS_FILE):
        try:
            with open(config.STATUS_FILE, "r") as f:
                status = json.load(f)
                last_429 = status.get("last_429_at", 0)
                # Wait 20 minutes after a 429
                if time.time() - last_429 < 1200:
                    wait_remaining = int(1200 - (time.time() - last_429))
                    logging.info(f"❄️ Rate limit cooldown active. Skipping run. ({wait_remaining}s left)")
                    return True
        except Exception:
            pass
    return False

def record_429():
    """Records a 429 encounter to the status file."""
    status = {}
    if os.path.exists(config.STATUS_FILE):
        try:
            with open(config.STATUS_FILE, "r") as f:
                status = json.load(f)
        except Exception:
            pass
    status["last_429_at"] = time.time()
    with open(config.STATUS_FILE, "w") as f:
        json.dump(status, f)

def main_loop(run_once=False):
    if check_cooldown():
        return

    logging.info("=== @ojizo-san is Awakening ===")
    replied_ids = load_replied_ids()
    
    # 1. Get Bot's own user ID
    my_id = config.BOT_ID
    username = config.BOT_HANDLE.replace("@", "")

    if not my_id:
        try:
            logging.info("🔍 Fetching Bot ID from X API...")
            me = x_client.get_me(user_auth=True)
            my_id = me.data.id
            username = me.data.username
            logging.info(f"✅ Bot ID Found: {my_id} (@{username})")
            logging.info("💡 Tip: Set BOT_ID in config.py to save this API call in the future.")
        except tweepy.TooManyRequests:
            logging.error("⛔ [RATE LIMIT] Could not fetch Bot ID. X API limit reached.")
            record_429()
            return
        except Exception as e:
            logging.error(f"Auth Error: {e}")
            return
    else:
        logging.info(f"🤖 Bot ID Loaded from config: {my_id} ({config.BOT_HANDLE})")

    while True:
        try:
            # 0. Check Schedule
            check_schedule()
            
            # 1. Check Mentions
            logging.info("👀 Checking mentions...")
            
            # Check Rate Limit Status (Optional but helpful for debugging)
            try:
                # We use the raw API for rate limit status as Tweepy Client doesn't expose it easily for V2 endpoints in a single call
                # But for now, we'll just try and catch 429 precisely
                mentions = x_client.get_users_mentions(
                    id=my_id,
                    max_results=10,
                    tweet_fields=["created_at", "author_id"],
                    user_auth=True
                )
            except tweepy.TooManyRequests:
                logging.error("⛔ [RATE LIMIT] X API limit reached. We must wait until the next 15-minute window.")
                record_429()
                if run_once: break
                return

            if mentions.data:
                for tweet in mentions.data:
                    if str(tweet.id) in replied_ids:
                        continue
                    if tweet.author_id == my_id:
                        continue

                    logging.info(f"✨ New prayer received from tweet {tweet.id}: {tweet.text[:30]}...")
                    context = get_thread_context(tweet.id)
                    reply_text = generate_grok_reply(context)
                    
                    if reply_text:
                        # Character Limit Check for Free/Basic accounts
                        if len(reply_text) > 280:
                            logging.warning(f"Response too long ({len(reply_text)} chars). Truncating...")
                            reply_text = reply_text[:277] + "..."
                        
                        logging.info(f"📿 Replying ({len(reply_text)} chars): {reply_text[:50]}...")
                        try:
                            # Use user_auth=True to be explicit about posting context
                            x_client.create_tweet(
                                text=reply_text,
                                in_reply_to_tweet_id=tweet.id,
                                user_auth=True
                            )
                            logging.info("✅ Threaded Reply Done.")
                        except Exception as reply_err:
                            logging.error(f"⚠️ Threaded reply failed (403?): {reply_err}")
                            try:
                                logging.info("🔄 Attempting standalone mention as fallback...")
                                x_client.create_tweet(text=reply_text, user_auth=True)
                                logging.info("✅ Standalone Mention Done.")
                            except Exception as fallback_err:
                                logging.error(f"❌ Fallback failed: {fallback_err}")
                        
                        save_replied_id(tweet.id)
                        replied_ids.add(str(tweet.id))
                        time.sleep(15)
            else:
                logging.info("🍃 No new mentions.")

            if run_once:
                logging.info("⚖️ One-shot execution complete. Entering deep meditation (Termination).")
                break

            # Wait (300s / 5 minutes is safer for Rate Limits)
            time.sleep(300)

        except Exception as e:
            logging.error(f"Error in main loop: {e}")
            if run_once: break
            time.sleep(60)

if __name__ == "__main__":
    # Support for Lolipop Cron (python ojizo_bot.py --once)
    run_once = "--once" in sys.argv
    main_loop(run_once=run_once)
