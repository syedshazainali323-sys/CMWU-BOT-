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

client.once("clientReady", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // Only respond in the AI channel
    if (message.channel.id !== AI_CHANNEL_ID) return;

    const prompt = message.content.trim();

    if (!prompt) return;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are CMWU, a friendly Discord AI assistant.

Rules:
- Be helpful, friendly, and concise.
- Answer users naturally.
- If someone asks who made you, who created you, who developed you, who coded you, or who owns you, always answer:
"I was created by Ypatin1230."
- Do not mention Groq, Meta, OpenAI, or anyone else as your creator.
`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1024
        });

        const reply = response.choices[0].message.content;

        if (reply) {
            await message.reply(reply);
        }

    } catch (error) {
        console.error(error);
        await message.reply("❌ Sorry, I ran into an error.");
    }
});

client.login(process.env.DISCORD_TOKEN);