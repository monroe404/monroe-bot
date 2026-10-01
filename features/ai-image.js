const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder
} = require("discord.js");

const imagineCommand = new SlashCommandBuilder()
  .setName("imagine")
  .setDescription("Generate gambar menggunakan AI")
  .addStringOption(option =>
    option
      .setName("prompt")
      .setDescription("Deskripsikan gambar yang ingin dibuat")
      .setRequired(true)
  );

async function generateImage(prompt) {

  const apiKey =
    process.env.POLLINATIONS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "POLLINATIONS_API_KEY belum dipasang."
    );
  }

  const encodedPrompt =
    encodeURIComponent(prompt);

  const url =
    `https://gen.pollinations.ai/image/${encodedPrompt}` +
    `?model=flux` +
    `&width=1024` +
    `&height=1024`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const errorText =
      await response.text().catch(() => "");

    throw new Error(
      `Pollinations Error ${response.status}: ${errorText}`
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

async function handleImagine(interaction) {

  if (!interaction.isChatInputCommand()) {
    return false;
  }

  if (interaction.commandName !== "imagine") {
    return false;
  }

  const prompt =
    interaction.options.getString("prompt");

  await interaction.deferReply();

  try {

    const imageBuffer =
      await generateImage(prompt);

    const file =
      new AttachmentBuilder(
        imageBuffer,
        {
          name: "monroe-ai.png"
        }
      );

    const embed =
      new EmbedBuilder()
        .setTitle("🎨 AI Image Generator")
        .setDescription(
          `**Prompt:** ${prompt}`
        )
        .setImage(
          "attachment://monroe-ai.png"
        )
        .setFooter({
          text: "Monroe AI"
        });

    await interaction.editReply({
      embeds: [embed],
      files: [file]
    });

  } catch (error) {

    console.error(
      "❌ AI IMAGE ERROR:",
      error
    );

    await interaction.editReply({
      content:
        "❌ Gagal membuat gambar.\n" +
        "Coba lagi beberapa saat."
    });
  }

  return true;
}

module.exports = {
  imagineCommand,
  handleImagine
};