const {
    AttachmentBuilder,
    EmbedBuilder
} = require("discord.js");

const axios = require("axios");

async function generateImage(prompt) {
    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
        throw new Error("POLLINATIONS_API_KEY belum dipasang.");
    }

    const encodedPrompt = encodeURIComponent(prompt);

    const url =
        `https://gen.pollinations.ai/image/${encodedPrompt}` +
        `?model=flux` +
        `&width=1024` +
        `&height=1024`;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        },
        responseType: "arraybuffer",
        timeout: 120000
    });

    return Buffer.from(response.data);
}

async function handleImagine(interaction) {
    if (!interaction.isChatInputCommand()) return false;
    if (interaction.commandName !== "imagine") return false;

    const prompt = interaction.options.getString("prompt");

    await interaction.deferReply();

    try {
        const imageBuffer = await generateImage(prompt);

        const file = new AttachmentBuilder(imageBuffer, {
            name: "ai-image.png"
        });

        const embed = new EmbedBuilder()
            .setTitle("🎨 AI Image Generator")
            .setDescription(`**Prompt:** ${prompt}`)
            .setImage("attachment://ai-image.png")
            .setFooter({
                text: "Monroe AI"
            });

        await interaction.editReply({
            embeds: [embed],
            files: [file]
        });

    } catch (error) {
        console.error("AI IMAGE ERROR:", error);

        await interaction.editReply({
            content: "❌ Gagal membuat gambar. Coba lagi nanti."
        });
    }

    return true;
}

module.exports = {
    handleImagine
};