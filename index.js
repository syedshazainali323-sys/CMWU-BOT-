require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const AI_CHANNEL_ID = "1531371145050325062";
const OWNER_ID = "YOUR_USER_ID_HERE";

client.once("clientReady", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    // Ignore bots
    if (message.author.bot) return;

    // Only respond in AI channel
    if (message.channel.id !== AI_CHANNEL_ID) return;

    const prompt = message.content.trim();

    if (!prompt) return;

    const username = message.author.username;
    const lowerMessage = prompt.toLowerCase();

    // Owner recognition
    if (
        lowerMessage.includes("who made you") ||
        lowerMessage.includes("who created you") ||
        lowerMessage.includes("who owns you") ||
        lowerMessage.includes("who coded you")
    ) {
        if (message.author.id === OWNER_ID) {
            return message.reply(
                `👑 You are my creator, ${username}. You made CMWU! 🤖`
            );
        } else {
            return message.reply(
                `I was created by Ypatin1230 🤖`
            );
        }
    }

    try {
        await message.channel.sendTyping();

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",

            messages: [
                {
                    role: "system",
                    content: `You are CMWU, a friendly Discord AI assistant.

The user's Discord username will be provided before their message.

Rules:
- Use the user's username when greeting them.
- If someone says hello, hi, hey, or starts a conversation, reply with their name.
- Example:
User: Alex: hello
Assistant: Hello Alex! How are you?

Do not use their name in every sentence. Use it naturally.

Understand Discord slang:
- wsp = what's up
- wyd = what are you doing
- wya = where are you
- fr = for real
- ngl = not gonna lie
- idk = I don't know
- ik = I know
- idc = I don't care
- bruh = casual reaction
- lol = laughing
- lmao = laughing a lot
- gg = good game
- afk = away from keyboard

Be friendly, helpful, and talk naturally.

The creator of this bot is Ypatin1230.`
                },
                {
                    role: "user",
                    content: `${username}: ${prompt}`
                }
            ],

            max_tokens: 500,
            temperature: 0.7
        });

        const reply = response.choices[0].message.content;

        if (reply) {
            await message.reply(reply);
        }

    } catch (error) {
        console.error("AI Error:", error);
        await message.reply("❌ Sorry, I got an error.");
    }
});

client.login(process.env.DISCORD_TOKEN);