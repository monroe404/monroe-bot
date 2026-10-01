const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder
} = require("discord.js");

// ========================================
// SLASH COMMAND
// ========================================

const removeBgCommand = new SlashCommandBuilder()
  .setName("removebg")
  .setDescription("Hapus background dari gambar")
  .addAttachmentOption(option =>
    option
      .setName("image")
      .setDescription("Upload gambar yang ingin dihapus background-nya")
      .setRequired(true)
  );

// ========================================
// REMOVE BACKGROUND
// ========================================

async function removeBackground(imageUrl) {

  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    throw new Error(
      "REMOVE_BG_API_KEY belum dipasang di Railway."
    );
  }

  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(
      `Gagal mengambil gambar: ${imageResponse.status}`
    );
  }

  const imageBuffer = Buffer.from(
    await imageResponse.arrayBuffer()
  );

  const formData = new FormData();

  formData.append(
    "image_file",
    new Blob([imageBuffer]),
    "input.png"
  );

  formData.append("size", "auto");

  const response = await fetch(
    "https://api.remove.bg/v1.0/removebg",
    {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey
      },
      body: formData
    }
  );

  if (!response.ok) {

    const errorText =
      await response.text().catch(() => "");

    throw new Error(
      `Remove.bg Error ${response.status}: ${errorText}`
    );
  }

  return Buffer.from(
    await response.arrayBuffer()
  );
}

// ========================================
// HANDLE /REMOVEBG
// ========================================

async function handleRemoveBg(interaction) {

  if (!interaction.isChatInputCommand()) {
    return false;
  }

  if (interaction.commandName !== "removebg") {
    return false;
  }

  const attachment =
    interaction.options.getAttachment("image");

  await interaction.deferReply();

  try {

    if (!attachment.contentType?.startsWith("image/")) {
      return await interaction.editReply({
        content:
          "❌ File yang kamu upload harus berupa gambar."
      });
    }

    const imageBuffer =
      await removeBackground(attachment.url);

    const file =
      new AttachmentBuilder(
        imageBuffer,
        {
          name: "monroe-no-bg.png"
        }
      );

    const embed =
      new EmbedBuilder()
        .setTitle("🖼️ AI Background Remover")
        .setDescription(
          "Background berhasil dihapus!"
        )
        .setImage(
          "attachment://monroe-no-bg.png"
        )
        .setFooter({
          text: "MONROE COMMUNITY © 2026"
        });

    await interaction.editReply({
      embeds: [embed],
      files: [file]
    });

  } catch (error) {

    console.error(
      "❌ REMOVE BG ERROR:",
      error
    );

    await interaction.editReply({
      content:
        "❌ Gagal menghapus background.\n" +
        "Pastikan gambar valid dan coba lagi."
    });

  }

  return true;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  removeBgCommand,
  handleRemoveBg
};