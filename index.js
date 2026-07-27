client.on("messageCreate", async (message) => {

    // Ignore bots
    if (message.author.bot) return;

    // Only respond to ! commands
    if (!message.content.startsWith("!")) return;

    const prompt = message.content.slice(1);

    if (!prompt) return;

    try {
        const response = await groq.chat.completions.create({
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
            model: "llama-3.1-8b-instant"
        });

        const reply = response.choices[0].message.content;

        await message.reply(reply);

    } catch (error) {
        console.error(error);
        await message.reply("❌ Something went wrong.");

    }
});