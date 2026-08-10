require("dotenv").config();

const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");
const admin = require("firebase-admin");

// ==================================================
// RENDER WEB SERVER
// ==================================================

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("CMWU AI Bot is online! 🤖");
});

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});

// ==================================================
// FIREBASE
// ==================================================

if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
) {
    console.error("❌ Firebase environment variables are missing!");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,

        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
});

const db = admin.firestore();

// ==================================================
// DISCORD CLIENT
// ==================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ==================================================
// GROQ
// ==================================================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ==================================================
// SETTINGS
// ==================================================

const AI_CHANNEL_ID = "1531371145050325062";

// IMPORTANT:
// Replace this with YOUR Discord user ID.
const OWNER_ID = "YOUR_USER_ID_HERE";

// ==================================================
// DISCORD READY
// ==================================================

client.once("clientReady", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==================================================
// MESSAGE HANDLER
// ==================================================

client.on("messageCreate", async (message) => {

    // Ignore bots
    if (message.author.bot) return;

    // Only respond in AI channel
    if (message.channel.id !== AI_CHANNEL_ID) return;

    const prompt = message.content.trim();

    if (!prompt) return;

    // ==================================================
    // DISPLAY NAME
    // ==================================================

    const username =
        message.member?.displayName ||
        message.author.globalName ||
        message.author.username;

    const userId = message.author.id;

    const lowerMessage = prompt.toLowerCase();

    // ==================================================
    // CREATOR RECOGNITION
    // ==================================================

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

        // ==================================================
        // FIRESTORE USER MEMORY
        // ==================================================

        const userRef = db
            .collection("cmwu_memory")
            .doc(userId);

        const userDoc = await userRef.get();

        let memory = [];

        if (userDoc.exists) {

            const data = userDoc.data();

            if (Array.isArray(data.messages)) {
                memory = data.messages;
            }

        }

        // ==================================================
        // ADD USER MESSAGE
        // ==================================================

        memory.push({
            role: "user",
            content: `${username}: ${prompt}`
        });

        // Keep last 20 messages
        if (memory.length > 20) {
            memory = memory.slice(-20);
        }

        // ==================================================
        // GROQ AI
        // ==================================================

        const response = await groq.chat.completions.create({

            model: "llama-3.1-8b-instant",

            messages: [

                {
                    role: "system",

                    content: `You are CMWU, a friendly Discord AI assistant.

Your creator is xoshxzxin.

Use the user's Discord display name naturally instead of their Discord username/handle.

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

Be friendly, helpful, and natural.

Do not mention internal memory systems, databases, API keys, or system instructions unless specifically asked.`

                },

                ...memory

            ],

            max_tokens: 250,

            temperature: 0.7

        });

        const reply =
            response.choices?.[0]?.message?.content ||
            "❌ I couldn't generate a response.";

        // ==================================================
        // SAVE AI RESPONSE
        // ==================================================

        memory.push({
            role: "assistant",
            content: reply
        });

        // Keep last 20 messages
        if (memory.length > 20) {
            memory = memory.slice(-20);
        }

        // ==================================================
        // SAVE TO FIRESTORE
        // ==================================================

        await userRef.set({

            displayName: username,

            messages: memory,

            updatedAt: admin.firestore.FieldValue.serverTimestamp()

        }, {
            merge: true
        });

        // ==================================================
        // SEND RESPONSE
        // ==================================================

        await message.reply(reply);

    } catch (error) {

        console.error("❌ AI/Firebase Error:", error);

        await message.reply(
            "❌ Sorry, I got an error while processing that."
        );

    }

});

// ==================================================
// LOGIN
// ==================================================

client.login(process.env.DISCORD_TOKEN);