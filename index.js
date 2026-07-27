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
    apiKey: process.env.GROQ_KEY
});

client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", async (message) => {

    // Ignore bots
    if (message.author.bot) return;

    // Hello command
    if (message.content === "!hello") {
        message.reply("Hello! I am CMWU Bot 🤖");
        return;
    }

    // AI command
    if (message.content.startsWith("!ai")) {

        const question = message.content
            .slice(3)
            .trim();

        if (!question) {
            message.reply("Ask me something after !ai 🤖");
            return;
        }

        try {
            await message.channel.sendTyping();

            const response = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content:
                        "You are CMWU Bot, a helpful gaming assistant. You give useful Roblox Rivals tips and friendly answers."
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                model: "llama-3.1-8b-instant"
            });

            let answer = response.choices[0].message.content;

            // Discord limit is 2000 characters
            if (answer.length > 2000) {
                answer = answer.slice(0, 1997) + "...";
            }

            message.reply({
                content: answer,
                allowedMentions: {
                    repliedUser: false
                }
            });

        } catch (error) {
            console.error(error);

            message.reply(
                "❌ Something went wrong with the AI. Check the bot logs."
            );
        }
    }
});


client.login(process.env.TOKEN);