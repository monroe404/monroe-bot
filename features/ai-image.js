const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder
} = require("discord.js");

// ========================================
// SLASH COMMAND
// ========================================

const imagineCommand = new SlashCommandBuilder()
  .setName("imagine")
  .setDescription("Generate gambar menggunakan AI")
  .addStringOption(option =>
    option
      .setName("prompt")
      .setDescription("Deskripsikan gambar yang ingin dibuat")
      .setRequired(true)
  );

// ========================================
// GENERATE IMAGE
// ========================================

async function generateImage(prompt) {

  const apiKey =
    process.env.POLLINATIONS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "POLLINATIONS_API_KEY belum dipasang."
    );
  }

  // Model image yang lebih baru
  const model =
    "openai/gpt-image-2";

  // Instruksi tambahan supaya objek lebih sesuai
  const enhancedPrompt = `
Create an image that follows the user's prompt exactly.

IMPORTANT:
- Preserve the exact objects requested by the user.
- Do not replace one object with another.
- If the user says CAR, generate a CAR, not a motorcycle.
- If the user says MOTORCYCLE, generate a MOTORCYCLE.
- Follow the requested subject, environment, clothing, pose, lighting and style.
- Do not randomly add unrelated main subjects.

USER PROMPT:
${prompt}
`;

  const encodedPrompt =
    encodeURIComponent(enhancedPrompt);

  const url =
    `https://gen.pollinations.ai/image/${encodedPrompt}` +
    `?model=${encodeURIComponent(model)}`;

  console.log(
    "🎨 Generating image with:",
    model
  );

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {

    const errorText =
      await response.text()
        .catch(() => "");

    throw new Error(
      `Pollinations Error ${response.status}: ${errorText}`
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

// ========================================
// HANDLE /IMAGINE
// ========================================

async function handleImagine(interaction) {

  if (!interaction.isChatInputCommand()) {
    return false;
  }

  if (
    interaction.commandName !==
    "imagine"
  ) {
    return false;
  }

  const prompt =
    interaction.options.getString(
      "prompt"
    );

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
        .setTitle(
          "🎨 AI Image Generator"
        )
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
        "Coba gunakan prompt lain."
    });

  }

  return true;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  imagineCommand,
  handleImagine
};