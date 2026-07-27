require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_KEY
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // AI command
    if (message.content.startsWith("!ai ")) {
        const question = message.content.slice(4);

        try {
            const response = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful Discord AI assistant."
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                model: "llama-3.3-70b-versatile"
            });

            const answer = response.choices[0].message.content;

            message.reply(answer);

        } catch (error) {
            console.log(error);
            message.reply("❌ AI error happened.");
        }
    }

    // Test command
    if (message.content === "!hello") {
        message.reply("Hello! I am CMWU Bot 🤖");
    }
});

client.login(process.env.TOKEN);