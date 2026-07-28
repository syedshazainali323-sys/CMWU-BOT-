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

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // Only allow the AI channel
    if (message.channel.id !== AI_CHANNEL_ID) return;

    // Only respond to !ai
    if (!message.content.startsWith("!ai")) return;

    // Get the prompt after !ai
    const prompt = message.content.slice(3).trim();

    if (!prompt) {
        return message.reply("❌ Please type a question after `!ai`.");
    }

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are CMWU, a helpful Discord AI assistant."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
        });

        await message.reply(response.choices[0].message.content);

    } catch (error) {
        console.error(error);
        await message.reply("❌ Something went wrong while contacting the AI.");
    }
});

client.login(process.env.DISCORD_TOKEN);