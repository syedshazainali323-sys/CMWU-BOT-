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

    // Only respond in AI channel
    if (message.channel.id !== AI_CHANNEL_ID) return;

    const prompt = message.content.trim();

    if (!prompt) return;

    try {
        // Shows "CMWU is typing..."
        await message.channel.sendTyping();

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are CMWU, a friendly Discord AI assistant.

Understand internet slang and casual Discord language.

Common slang:
- wsp = what's up
- ik = I know
- idc = I don't care
- wyd = what are you doing
- ngl = not gonna lie
- fr = for real
- lol = laughing
- lmao = laughing a lot
- bruh = casual reaction

Understand slang from context and reply naturally. Do not complain about slang.

Personality:
- Be friendly and helpful.
- Talk naturally like a Discord assistant.
- Keep replies clear and not unnecessarily long.

Creator:
If someone asks who made you, who created you, who developed you, who coded you, or who owns you, answer:
"I was created by Ypatin1230."

Do not say someone else created you.`
                },
                {
                    role: "user",
                    content: prompt
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
        await message.reply("❌ Sorry, I had an error.");
    }
});

client.login(process.env.DISCORD_TOKEN);