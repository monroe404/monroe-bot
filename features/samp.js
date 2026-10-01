const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags
} = require("discord.js");

const SAMP_CHANNEL_ID =
  process.env.SAMP_CHANNEL_ID;

const API_URL =
  "http://sam.markski.ar/api/GetFilteredServers";

let sampMessage = null;
let currentPage = 0;

const SERVERS_PER_PAGE = 10;

// ========================================
// FETCH SERVER
// ========================================

async function getSampServers() {

  const url =
    API_URL +
    "?show_empty=1&order=players&paging_size=50&page=1";

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `SAMonitor HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Format data server tidak valid."
    );
  }

  return data;
}

// ========================================
// FORMAT SERVER
// ========================================

function formatServer(server, number) {

  const name =
    server.name ||
    "Unknown Server";

  const players =
    Number(server.playersOnline ?? 0);

  const maxPlayers =
    Number(server.maxPlayers ?? 0);

  const ip =
    server.ipAddr ||
    "Unknown IP";

  const gameMode =
    server.gameMode ||
    "Unknown";

  const version =
    server.version ||
    "Unknown";

  const language =
    server.language ||
    "Unknown";

  return (
    `**${number}. ${name}**\n` +
    `> 🟢 **${players}/${maxPlayers} Players**\n` +
    `> 🌐 \`${ip}\`\n` +
    `> 🎮 ${gameMode}\n` +
    `> ⚙️ ${version} • ${language}`
  );
}

// ========================================
// BUILD PANEL
// ========================================

function buildPanel(servers) {

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        servers.length /
        SERVERS_PER_PAGE
      )
    );

  if (currentPage >= totalPages) {
    currentPage =
      totalPages - 1;
  }

  const start =
    currentPage *
    SERVERS_PER_PAGE;

  const pageServers =
    servers.slice(
      start,
      start + SERVERS_PER_PAGE
    );

  const container =
    new ContainerBuilder();

  // HEADER
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "# MONROE SAMP SERVER LIST\n" +
      "Live server information • Updated automatically"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  // SERVERS
  if (pageServers.length === 0) {

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "⚠️ Tidak ada server yang ditemukan."
      )
    );

  } else {

    pageServers.forEach(
      (server, index) => {

        const number =
          start + index + 1;

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            formatServer(
              server,
              number
            )
          )
        );

        if (
          index <
          pageServers.length - 1
        ) {

          container.addSeparatorComponents(
            new SeparatorBuilder()
          );

        }

      }
    );

  }

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  // FOOTER
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `📊 **${servers.length} Servers** • ` +
      `Page **${currentPage + 1}/${totalPages}**\n` +
      "MONROE COMMUNITY © 2026"
    )
  );

  // BUTTONS
  const buttons =
    new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(
          "monroe_samp_previous"
        )
        .setLabel("Previous")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(
          currentPage === 0
        ),

      new ButtonBuilder()
        .setCustomId(
          "monroe_samp_refresh"
        )
        .setLabel("Refresh")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(
          "monroe_samp_next"
        )
        .setLabel("Next")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(
          currentPage >= totalPages - 1
        )

    );

  container.addActionRowComponents(
    buttons
  );

  return container;
}

// ========================================
// UPDATE PANEL
// ========================================

async function updateSampPanel(
  client,
  interaction = null
) {

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

    const panel =
      buildPanel(servers);

    // BUTTON INTERACTION
    if (interaction) {

      await interaction.update({
        components: [panel],
        flags: MessageFlags.IsComponentsV2
      });

      sampMessage =
        await channel.messages.fetch(
          interaction.message.id
        );

      return;

    }

    // EXISTING MESSAGE
    if (sampMessage) {

      try {

        await sampMessage.edit({
          components: [panel],
          flags: MessageFlags.IsComponentsV2
        });

        return;

      } catch {
        sampMessage = null;
      }

    }

    // FIND OLD MONROE PANEL
    const messages =
      await channel.messages.fetch({
        limit: 20
      });

    const oldMessage =
      messages.find(
        message =>
          message.author.id ===
          client.user.id &&
          message.components?.length > 0
      );

    if (oldMessage) {

      sampMessage =
        oldMessage;

      await sampMessage.edit({
        components: [panel],
        flags: MessageFlags.IsComponentsV2
      });

      return;
    }

    // CREATE NEW
    sampMessage =
      await channel.send({
        components: [panel],
        flags: MessageFlags.IsComponentsV2
      });

  } catch (error) {

    console.error(
      "❌ SAMP Panel Error:",
      error
    );

  }

}

// ========================================
// AUTO UPDATE
// ========================================

async function startSampSystem(client) {

  if (!SAMP_CHANNEL_ID) {

    console.log(
      "⚠️ SAMP_CHANNEL_ID belum diatur."
    );

    return;
  }

  console.log(
    "🎮 Monroe SAMP System aktif."
  );

  await updateSampPanel(client);

  setInterval(
    async () => {

      await updateSampPanel(client);

    },
    60 * 1000
  );

}

// ========================================
// BUTTON
// ========================================

async function handleSampInteraction(
  interaction
) {

  if (!interaction.isButton()) {
    return false;
  }

  if (
    !interaction.customId.startsWith(
      "monroe_samp_"
    )
  ) {
    return false;
  }

  if (
    interaction.customId ===
    "monroe_samp_previous"
  ) {

    currentPage--;

    if (currentPage < 0) {
      currentPage = 0;
    }

  }

  if (
    interaction.customId ===
    "monroe_samp_next"
  ) {

    currentPage++;

  }

  // REFRESH TETAP DI PAGE SEKARANG

  const client =
    interaction.client;

  await updateSampPanel(
    client,
    interaction
  );

  return true;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  startSampSystem,
  handleSampInteraction
};