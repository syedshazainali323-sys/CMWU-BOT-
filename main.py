import os
import asyncio
from flask import Flask
import threading
import discord
from discord.ext import commands
from google import genai

# 1. Initialize Flask Web Server
app = Flask(__name__)

@app.route('/')
def home():
    return "CMWU BOT is running!"

def run_flask():
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)

threading.Thread(target=run_flask, daemon=True).start()

# 2. Setup Discord Bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

# 3. Setup Gemini Client
gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")

@bot.command(name="ask")
async def ask(ctx, *, prompt: str):
    async with ctx.typing():
        try:
            # gemini-1.5-flash works on free keys without rate limit issues
            response = gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
            )
            
            reply_text = response.text
            
            if len(reply_text) > 2000:
                for i in range(0, len(reply_text), 1900):
                    await ctx.send(reply_text[i:i+1900])
            else:
                await ctx.send(reply_text)
                
        except Exception as e:
            await ctx.send(f"An error occurred: {e}")

# 4. Run Discord Bot
token = os.environ.get("DISCORD_TOKEN")
if token:
    bot.run(token)
else:
    print("Error: DISCORD_TOKEN environment variable not set.")
