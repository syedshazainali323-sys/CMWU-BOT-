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

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

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