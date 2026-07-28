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


const AI_CHANNEL_ID = "1531371145050325062";
const OWNER_ID = "YOUR_USER_ID_HERE";


// Temporary memory
const userMemory = new Map();


client.once("clientReady", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});


client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (message.channel.id !== AI_CHANNEL_ID) return;


    const prompt = message.content.trim();

    if (!prompt) return;


    const username = message.author.username;
    const userId = message.author.id;
    const lowerMessage = prompt.toLowerCase();


    // Owner recognition
    if (
        lowerMessage.includes("who made you") ||
        lowerMessage.includes("who created you") ||
        lowerMessage.includes("who owns you") ||
        lowerMessage.includes("who coded you")
    ) {

        if (userId === OWNER_ID) {
            return message.reply(
                `👑 You are my creator, xoshxzxin. You made CMWU! 🤖`
            );
        } else {
            return message.reply(
                `I was created by xoshxzxin 🤖`
            );
        }
    }


    try {

        await message.channel.sendTyping();


        if (!userMemory.has(userId)) {
            userMemory.set(userId, []);
        }


        const memory = userMemory.get(userId);


        memory.push({
            role: "user",
            content: `${username}: ${prompt}`
        });


        // Keep last 10 messages
        if (memory.length > 10) {
            memory.shift();
        }


        const response = await groq.chat.completions.create({

            model: "llama-3.1-8b-instant",

            messages: [

                {
                    role: "system",
                    content: `You are CMWU, a friendly Discord AI assistant.

Your creator is xoshxzxin.

Use the user's Discord username naturally.

Example:
User: Alex: hello
Assistant: Hello Alex! How are you?

Remember previous messages from the same conversation.

Understand Discord slang:

wsp = what's up
wyd = what are you doing
wya = where are you
fr = for real
ngl = not gonna lie
idk = I don't know
ik = I know
idc = I don't care
bruh = reaction
lol = laughing
lmao = laughing a lot
gg = good game
afk = away from keyboard

Be friendly, helpful, and natural.`
                },

                ...memory

            ],

            max_tokens: 250,
            temperature: 0.7
        });


        const reply = response.choices[0].message.content;


        memory.push({
            role: "assistant",
            content: reply
        });


        await message.reply(reply);


    } catch (error) {

        console.error("AI Error:", error);

        await message.reply("❌ Sorry, I got an error.");

    }

});


client.login(process.env.DISCORD_TOKEN);