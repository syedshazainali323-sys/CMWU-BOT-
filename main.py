import os
from flask import Flask
from threading import Thread
import discord
from discord.ext import commands
from google import genai

# --- 1. Web Server (Keeps Render Happy) ---
app = Flask('')

@app.route('/')
def home():
    return "Bot is online!"

def run_flask():
    port = int(os.environ.get("PORT", 3000))
    app.run(host='0.0.0.0', port=port)

# Run Flask on a background thread
Thread(target=run_flask, daemon=True).start()

# --- 2. Discord & Gemini Setup ---
DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

gemini_client = genai.Client(api_key=GEMINI_API_KEY)

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user.name}")

@bot.command(name="ask")
async def ask(ctx, *, prompt: str):
    async with ctx.typing():
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            await ctx.send(response.text)
        except Exception as e:
            await ctx.send(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)
