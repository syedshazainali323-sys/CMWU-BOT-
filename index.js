require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Put your AI channel ID here
const AI_CHANNEL_ID = "1531371145050325062";

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    // Ignore bots
    if (message.author.bot) return;

    // Only talk in the AI channel
    if (message.channel.id !== AI_CHANNEL_ID) return;

    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are CMWU, a helpful Discord AI assistant."
                },
                {
                    role: "user",
                    content: message.content
                }
            ],
            model: "llama-3.1-8b-instant"
        });

        const reply = response.choices[0].message.content;

        await message.reply(reply);

    } catch (error) {
        console.error(error);
        await message.reply("❌ Something went wrong.");
    }
});

client.login(process.env.DISCORD_TOKEN);