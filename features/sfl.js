const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

const SFL_API_URL =
  "https://zennq.my.id/api/bypass";

// ========================================
// SFL BYPASS
// ========================================

async function bypassSFL(url) {
  if (!url) {
    throw new Error(
      "URL belum diberikan."
    );
  }

  const apiKey =
    process.env.SFL_API_KEY;

  if (!apiKey) {
    throw new Error(
      "SFL_API_KEY belum dipasang di Railway."
    );
  }

  const response =
    await fetch(
      SFL_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },

        body: JSON.stringify({
          url
        })
      }
    );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "API mengembalikan response yang tidak valid."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `API Error ${response.status}`
    );
  }

  const bypassedUrl =
    data?.data?.bypassedUrl;

  if (!bypassedUrl) {
    throw new Error(
      data?.message ||
      "API tidak mengembalikan bypassedUrl."
    );
  }

  return bypassedUrl;
}

// ========================================
// COMPONENTS V2
// ========================================

function buildResultComponents(
  resultUrl
) {
  const container =
    new ContainerBuilder()
      .setAccentColor(0xFF7A00);

  // ======================================
  // TITLE
  // ======================================

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        "# ⚡ BYPASS BERHASIL"
      )
  );

  // ======================================
  // SEPARATOR
  // ======================================

  container.addSeparatorComponents(
    new SeparatorBuilder()
      .setSpacing(
        SeparatorSpacingSize.Small
      )
  );

  // ======================================
  // RESULT
  // ======================================

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        "### ✅ Link berhasil diproses\n" +
        "Link kamu sudah berhasil dilewati dan siap digunakan.\n\n" +
        "Tekan tombol **DOWNLOAD** di bawah untuk membuka hasilnya."
      )
  );

  // ======================================
  // DOWNLOAD BUTTON
  // ======================================

  const row =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(
            "DOWNLOAD"
          )
          .setEmoji(
            "📥"
          )
          .setStyle(
            ButtonStyle.Link
          )
          .setURL(
            resultUrl
          )
      );

  container.addActionRowComponents(
    row
  );

  return [
    container
  ];
}

// ========================================
// DISCORD MESSAGE
// ========================================

async function handleSFL(message) {
  if (
    !message ||
    message.author.bot
  ) {
    return;
  }

  const content =
    message.content.trim();

  if (
    !content
      .toLowerCase()
      .startsWith("!sfl ")
  ) {
    return;
  }

  const url =
    content
      .slice(5)
      .trim();

  if (!url) {
    await message.reply({
      content:
        "❌ Masukkan URL SFL.\n\nContoh: `!sfl https://sfl.gl/xxx`"
    });

    return;
  }

  try {

    const result =
      await bypassSFL(url);

    const components =
      buildResultComponents(
        result
      );

    await message.reply({
      components,

      flags:
        MessageFlags.IsComponentsV2
    });

  } catch (error) {

    console.error(
      "❌ SFL Error:",
      error
    );

    await message.reply({
      content:
        `❌ Gagal memproses URL.\n\`${error.message}\``
    });

  }
}

module.exports = {
  bypassSFL,
  buildResultComponents,
  handleSFL
};