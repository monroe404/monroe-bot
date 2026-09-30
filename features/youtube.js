const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// ========================================
// MONROE YOUTUBE COMMAND
// ========================================

const youtubeCommand = new SlashCommandBuilder()
  .setName("dyt")
  .setDescription("Download video YouTube")
  .addStringOption(option =>
    option
      .setName("url")
      .setDescription("Link video YouTube")
      .setRequired(true)
  );

// ========================================
// /dyt
// ========================================

async function handleYoutube(interaction) {

  if (
    !interaction.isChatInputCommand() ||
    interaction.commandName !== "dyt"
  ) {
    return false;
  }

  const url =
    interaction.options.getString("url");

  // ======================================
  // VALIDATE YOUTUBE URL
  // ======================================

  if (
    !url.includes("youtube.com/") &&
    !url.includes("youtu.be/")
  ) {

    await interaction.reply({
      content:
        "❌ Link yang kamu masukkan bukan link YouTube.",
      ephemeral: true
    });

    return true;
  }

  // ======================================
  // FORMAT MENU
  // ======================================

  const menu =
    new StringSelectMenuBuilder()
      .setCustomId(
        `monroe_youtube_format:${encodeURIComponent(url)}`
      )
      .setPlaceholder("Pilih format")
      .addOptions(
        {
          label: "MP3",
          description: "Audio YouTube",
          value: "mp3",
          emoji: "🎵"
        },
        {
          label: "MP4",
          description: "Video YouTube",
          value: "mp4",
          emoji: "🎬"
        }
      );

  const row =
    new ActionRowBuilder()
      .addComponents(menu);

  // ======================================
  // EMBED
  // ======================================

  const embed =
    new EmbedBuilder()
      .setColor(0xff8a00)
      .setTitle("MONROE YOUTUBE")
      .setDescription(
        "Pilih format yang ingin kamu download."
      )
      .setFooter({
        text:
          "MONROE COMMUNITY © 2026"
      });

  await interaction.reply({
    embeds: [embed],
    components: [row]
  });

  return true;
}

// ========================================
// FORMAT INTERACTION
// ========================================

async function handleYoutubeInteraction(
  interaction
) {

  if (
    !interaction.isStringSelectMenu()
  ) {
    return false;
  }

  if (
    !interaction.customId.startsWith(
      "monroe_youtube_format:"
    )
  ) {
    return false;
  }

  const format =
    interaction.values[0];

  const encodedUrl =
    interaction.customId.substring(
      "monroe_youtube_format:".length
    );

  const url =
    decodeURIComponent(encodedUrl);

  // ======================================
  // QUALITY
  // ======================================

  let qualities;

  if (format === "mp3") {

    qualities = [
      ["64 kbps", "64"],
      ["128 kbps", "128"],
      ["192 kbps", "192"],
      ["256 kbps", "256"],
      ["320 kbps", "320"]
    ];

  } else {

    qualities = [
      ["144p", "144"],
      ["240p", "240"],
      ["360p", "360"],
      ["480p", "480"],
      ["720p", "720"]
    ];

  }

  const menu =
    new StringSelectMenuBuilder()
      .setCustomId(
        `monroe_youtube_quality:${format}:${encodeURIComponent(url)}`
      )
      .setPlaceholder("Pilih kualitas")
      .addOptions(
        qualities.map(
          ([label, value]) => ({
            label,
            value
          })
        )
      );

  const row =
    new ActionRowBuilder()
      .addComponents(menu);

  // ======================================
  // EMBED
  // ======================================

  const embed =
    new EmbedBuilder()
      .setColor(0xff8a00)
      .setTitle(
        `MONROE ${format.toUpperCase()}`
      )
      .setDescription(
        `Format: **${format.toUpperCase()}**\n\n` +
        "Pilih kualitas download."
      )
      .setFooter({
        text:
          "MONROE COMMUNITY © 2026"
      });

  await interaction.update({
    embeds: [embed],
    components: [row]
  });

  return true;
}

// ========================================
// QUALITY + API
// ========================================

async function handleYoutubeQuality(
  interaction
) {

  if (
    !interaction.isStringSelectMenu()
  ) {
    return false;
  }

  if (
    !interaction.customId.startsWith(
      "monroe_youtube_quality:"
    )
  ) {
    return false;
  }

  const parts =
    interaction.customId.split(":");

  const format =
    parts[1];

  const encodedUrl =
    parts.slice(2).join(":");

  const url =
    decodeURIComponent(encodedUrl);

  const quality =
    interaction.values[0];

  // ======================================
  // PROCESSING
  // ======================================

  await interaction.update({
    embeds: [
      new EmbedBuilder()
        .setColor(0xff8a00)
        .setTitle(
          "MONROE YOUTUBE"
        )
        .setDescription(
          "⏳ **Sedang memproses...**\n\n" +
          `🎧 Format: **${format.toUpperCase()}**\n` +
          `⚙️ Kualitas: **${quality}${format === "mp3" ? " kbps" : "p"}**`
        )
        .setFooter({
          text:
            "MONROE COMMUNITY © 2026"
        })
    ],
    components: []
  });

  try {

    // ====================================
    // API KEY
    // ====================================

    const apiKey =
      process.env.JAKY_API_KEY;

    if (!apiKey) {

      throw new Error(
        "Layanan download belum dikonfigurasi."
      );

    }

    // ====================================
    // API REQUEST
    // ====================================

    const apiUrl =
      "https://api.jaky.dev/v1/download/youtube" +
      "?url=" +
      encodeURIComponent(url) +
      "&format=" +
      encodeURIComponent(format) +
      "&quality=" +
      encodeURIComponent(quality);

    const response =
      await fetch(
        apiUrl,
        {
          method: "GET",

          headers: {
            "x-jaky-key": apiKey
          }
        }
      );

    const data =
      await response.json();

    console.log(
      "Monroe YouTube Response:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    // ====================================
    // API ERROR
    // ====================================

    if (!response.ok) {

      throw new Error(
        data.message ||
        data.msg ||
        "Download gagal."
      );

    }

    // ====================================
    // FIND DOWNLOAD URL
    // ====================================

    function findDownloadUrl(obj) {

      if (
        !obj ||
        typeof obj !== "object"
      ) {
        return null;
      }

      for (
        const [key, value]
        of Object.entries(obj)
      ) {

        if (
          typeof value === "string" &&
          /^https?:\/\//i.test(value)
        ) {

          const keyName =
            key.toLowerCase();

          if (
            keyName.includes("url") ||
            keyName.includes("download") ||
            keyName.includes("link")
          ) {

            return value;

          }

        }

        if (
          typeof value === "object"
        ) {

          const result =
            findDownloadUrl(value);

          if (result) {
            return result;
          }

        }

      }

      return null;
    }

    const downloadUrl =
      findDownloadUrl(data);

    if (!downloadUrl) {

      throw new Error(
        "Link download tidak ditemukan."
      );

    }

    // ====================================
    // SUCCESS
    // ====================================

    const embed =
      new EmbedBuilder()
        .setColor(0xff8a00)
        .setTitle(
          "MONROE YOUTUBE"
        )
        .setDescription(
          "✅ **Download siap!**\n\n" +
          `🎧 Format: **${format.toUpperCase()}**\n` +
          `⚙️ Kualitas: **${quality}${format === "mp3" ? " kbps" : "p"}**`
        )
        .setFooter({
          text:
            "MONROE COMMUNITY © 2026"
        });

    const button =
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel(
              "DOWNLOAD"
            )
            .setEmoji("⬇️")
            .setStyle(
              ButtonStyle.Link
            )
            .setURL(
              downloadUrl
            )
        );

    await interaction.editReply({
      embeds: [embed],
      components: [button]
    });

  } catch (error) {

    console.error(
      "Monroe YouTube Error:",
      error
    );

    // ====================================
    // ERROR
    // ====================================

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle(
            "MONROE YOUTUBE"
          )
          .setDescription(
            "❌ Gagal memproses video.\n\n" +
            "Silakan coba lagi beberapa saat."
          )
          .setFooter({
            text:
              "MONROE COMMUNITY © 2026"
          })
      ],
      components: []
    });

  }

  return true;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  youtubeCommand,
  handleYoutube,
  handleYoutubeInteraction,
  handleYoutubeQuality
};