const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags
} = require("discord.js");

// ========================================
// CONFIG
// ========================================

const SAMP_CHANNEL_ID =
  process.env.SAMP_CHANNEL_ID;

const UPDATE_INTERVAL =
  60 * 1000;

const SERVERS_PER_PAGE = 10;

// ========================================
// GET SA-MP.CO.ID SERVER LIST
// ========================================

async function getSampServers() {

  const response = await fetch(
    "https://r.jina.ai/https://sa-mp.co.id/",
    {
      headers: {
        "User-Agent":
          "Monroe-Discord-Bot/1.0"
      }
    }
  );

  if (!response.ok) {

    throw new Error(
      `sa-mp.co.id HTTP ${response.status}`
    );

  }

  const text =
    await response.text();

  // ======================================
  // FIND SERVER LIST
  // ======================================

  const start =
    text.indexOf(
      "Server List Indonesia"
    );

  if (start === -1) {

    throw new Error(
      "Server List Indonesia tidak ditemukan."
    );

  }

  const section =
    text.substring(start);

  const lines =
    section.split("\n");

  const servers = [];

  // ======================================
  // PARSE TABLE
  // ======================================

  for (const rawLine of lines) {

    const line =
      rawLine.trim();

    if (!line.startsWith("|")) {
      continue;
    }

    if (
      line.includes("Nama") &&
      line.includes("Players")
    ) {
      continue;
    }

    if (
      line.includes("---")
    ) {
      continue;
    }

    const columns =
      line
        .split("|")
        .map(x => x.trim())
        .filter(Boolean);

    if (columns.length < 2) {
      continue;
    }

    // Kolom terakhir biasanya:
    // 300 / 600
    const playerText =
      columns[columns.length - 1];

    const match =
      playerText.match(
        /(\d+)\s*\/\s*(\d+)/
      );

    if (!match) {
      continue;
    }

    const players =
      Number(match[1]);

    const maxPlayers =
      Number(match[2]);

    // ====================================
    // SERVER NAME
    // ====================================

    let name =
      columns[0];

    // Hilangkan "Image: ..."
    name =
      name.replace(
        /^Image:\s*/i,
        ""
      );

    // Bersihkan markdown
    name =
      name
        .replace(/\*\*/g, "")
        .replace(/\[|\]/g, "")
        .trim();

    if (!name) {
      name =
        "Unknown Server";
    }

    // ====================================
    // REMOVE DUPLICATE
    // ====================================

    const duplicate =
      servers.some(
        server =>
          server.name === name &&
          server.players === players &&
          server.maxPlayers ===
            maxPlayers
      );

    if (duplicate) {
      continue;
    }

    servers.push({
      name,
      players,
      maxPlayers
    });

  }

  return servers;
}

// ========================================
// BUILD COMPONENTS V2
// ========================================

function buildSampComponents(
  servers,
  page = 1
) {

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        servers.length /
          SERVERS_PER_PAGE
      )
    );

  if (page > totalPages) {
    page = totalPages;
  }

  if (page < 1) {
    page = 1;
  }

  const start =
    (page - 1) *
    SERVERS_PER_PAGE;

  const currentServers =
    servers.slice(
      start,
      start + SERVERS_PER_PAGE
    );

  // ======================================
  // CONTAINER
  // ======================================

  const container =
    new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        "# 🎮 MONROE SAMP SERVER LIST\n" +
        "Server List Indonesia • Live"
      )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  // ======================================
  // SERVER LIST
  // ======================================

  if (
    currentServers.length === 0
  ) {

    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          "⚠️ Server tidak ditemukan."
        )
    );

  } else {

    const text =
      currentServers
        .map(
          (server, index) => {

            const number =
              start + index + 1;

            let status =
              "🔴";

            if (
              server.players > 0
            ) {
              status = "🟢";
            }

            return (
              `**${number}. ${server.name}**\n` +
              `${status} **${server.players}/${server.maxPlayers} Players**`
            );

          }
        )
        .join("\n\n");

    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(text)
    );

  }

  // ======================================
  // FOOTER
  // ======================================

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  const totalPlayers =
    servers.reduce(
      (total, server) =>
        total + server.players,
      0
    );

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        `📊 **${servers.length} Server** • ` +
        `👥 **${totalPlayers} Players**\n` +
        `📄 Page **${page}/${totalPages}**\n` +
        `🔄 Updated <t:${Math.floor(
          Date.now() / 1000
        )}:R>`
      )
  );

  // ======================================
  // BUTTONS
  // ======================================

  const previousButton =
    new ButtonBuilder()
      .setCustomId(
        `monroe_samp_page:${page - 1}`
      )
      .setLabel("PREVIOUS")
      .setEmoji("◀️")
      .setStyle(
        ButtonStyle.Secondary
      )
      .setDisabled(
        page <= 1
      );

  const refreshButton =
    new ButtonBuilder()
      .setCustomId(
        "monroe_samp_refresh"
      )
      .setLabel("REFRESH")
      .setEmoji("🔄")
      .setStyle(
        ButtonStyle.Secondary
      );

  const nextButton =
    new ButtonBuilder()
      .setCustomId(
        `monroe_samp_page:${page + 1}`
      )
      .setLabel("NEXT")
      .setEmoji("▶️")
      .setStyle(
        ButtonStyle.Secondary
      )
      .setDisabled(
        page >= totalPages
      );

  container.addActionRowComponents(
    new ActionRowBuilder()
      .addComponents(
        previousButton,
        refreshButton,
        nextButton
      )
  );

  return container;
}

// ========================================
// FIND MONROE MESSAGE
// ========================================

async function findSampMessage(
  channel,
  client
) {

  const messages =
    await channel.messages.fetch({
      limit: 20
    });

  return messages.find(
    message =>
      message.author.id ===
      client.user.id
  );
}

// ========================================
// UPDATE PANEL
// ========================================

async function updateSampPanel(
  client,
  page = 1
) {

  if (!SAMP_CHANNEL_ID) {

    console.log(
      "⚠️ SAMP_CHANNEL_ID belum diatur."
    );

    return;
  }

  try {

    const channel =
      await client.channels.fetch(
        SAMP_CHANNEL_ID
      );

    if (!channel) {

      throw new Error(
        "Channel SAMP tidak ditemukan."
      );

    }

    const servers =
      await getSampServers();

    console.log(
      `🎮 SA-MP Indonesia: ${servers.length} server`
    );

    const components =
      buildSampComponents(
        servers,
        page
      );

    const existing =
      await findSampMessage(
        channel,
        client
      );

    if (existing) {

      await existing.edit({

        components: [
          components
        ],

        flags:
          MessageFlags.IsComponentsV2

      });

    } else {

      await channel.send({

        components: [
          components
        ],

        flags:
          MessageFlags.IsComponentsV2

      });

    }

  } catch (error) {

    console.error(
      "❌ SAMP Error:",
      error
    );

  }
}

// ========================================
// AUTO UPDATE
// ========================================

function startSampSystem(
  client
) {

  // Update pertama
  updateSampPanel(
    client,
    1
  );

  // Update setiap 1 menit
  setInterval(
    () => {

      updateSampPanel(
        client,
        1
      );

    },
    UPDATE_INTERVAL
  );

}

// ========================================
// BUTTON INTERACTION
// ========================================

async function handleSampInteraction(
  interaction
) {

  if (
    !interaction.isButton()
  ) {

    return false;

  }

  // ======================================
  // REFRESH
  // ======================================

  if (
    interaction.customId ===
    "monroe_samp_refresh"
  ) {

    await interaction.deferUpdate();

    await updateSampPanel(
      interaction.client,
      1
    );

    return true;

  }

  // ======================================
  // PAGINATION
  // ======================================

  if (
    interaction.customId.startsWith(
      "monroe_samp_page:"
    )
  ) {

    const page =
      Number(
        interaction.customId
          .split(":")[1]
      );

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {

      return true;

    }

    await interaction.deferUpdate();

    const servers =
      await getSampServers();

    const components =
      buildSampComponents(
        servers,
        page
      );

    await interaction.message.edit({

      components: [
        components
      ],

      flags:
        MessageFlags.IsComponentsV2

    });

    return true;

  }

  return false;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  startSampSystem,
  handleSampInteraction
};