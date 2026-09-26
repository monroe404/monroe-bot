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

const SFL_CHANNEL_ID =
  "1551955190687731732";

const SFL_API_URL =
  "https://zennq.my.id/api/bypass";

// =========================
// BYPASS API
// =========================

async function bypassSFL(url) {
  if (!url) {
    throw new Error("URL belum diberikan.");
  }

  const apiKey =
    process.env.SFL_API_KEY;

  if (!apiKey) {
    throw new Error(
      "SFL_API_KEY belum dipasang di Railway."
    );
  }

  const response = await fetch(
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

// =========================
// RESULT COMPONENT
// =========================

function buildResultComponents(
  resultUrl
) {
  const container =
    new ContainerBuilder()
      .setAccentColor(0xFF7A00);

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        "# ⚡ BYPASS SUCCEED"
      )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
      .setSpacing(
        SeparatorSpacingSize.Small
      )
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        "### ✅ Link berhasil diproses\n" +
        "Link kamu sudah berhasil dilewati dan siap digunakan.\n\n" +
        "Tekan tombol **DOWNLOAD** di bawah untuk membuka hasilnya."
      )
  );

  const row =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("DOWNLOAD")
          .setEmoji("📥")
          .setStyle(ButtonStyle.Link)
          .setURL(resultUrl)
      );

  container.addActionRowComponents(
    row
  );

  return [container];
}

// =========================
// URL DETECTOR
// =========================

function extractUrl(content) {
  if (!content) return null;

  const match =
    content.match(
      /https?:\/\/[^\s<]+/i
    );

  if (!match) return null;

  return match[0]
    .replace(/[)>.,!?]+$/, "");
}

// =========================
// HANDLE AUTO BYPASS
// =========================

async function handleSFL(message) {
  if (!message) return;

  if (message.author.bot) return;

  // HANYA CHANNEL SKIPLINK
  if (
    message.channel.id !==
    SFL_CHANNEL_ID
  ) {
    return;
  }

  const url =
    extractUrl(message.content);

  if (!url) return;

  try {
    const result =
      await bypassSFL(url);

    const components =
      buildResultComponents(result);

    await message.reply({
      components,
      flags:
        MessageFlags.IsComponentsV2
    });

  } catch (error) {
    console.error(
      "❌ Skiplink Error:",
      error
    );

    await message.reply({
      content:
        "❌ Link gagal diproses."
    });
  }
}

module.exports = {
  bypassSFL,
  buildResultComponents,
  handleSFL
};