#!/bin/bash

# Lolipop Python PATH (Standard location)
PYTHON_PATH="/usr/local/bin/python3"

# Move to the directory where the bot is located
# Lolipop's Cron runs in a different home environment, so absolute path is safer.
cd /home/users/0/main.jp-4196010cee8220d1/web/ojizo_bot/

# Install dependencies only if flag file is missing
if [ ! -f "deps_installed.flag" ]; then
    echo "📦 First-time setup: Installing dependencies..." >> bot_log.txt 2>&1
    $PYTHON_PATH -m pip install "urllib3<2.0.0" pytz tweepy openai python-dotenv --user >> bot_log.txt 2>&1
    touch deps_installed.flag
fi

# Run the bot in one-shot mode
$PYTHON_PATH ojizo_bot.py --once >> bot_log.txt 2>&1
