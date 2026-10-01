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

const UPDATE_INTERVAL =
  60 * 1000;

// ========================================
// GET SAMP SERVERS
// ========================================

async function getSampServers() {

  const response = await fetch(
    "https://api.open.mp/servers"
  );

  if (!response.ok) {
    throw new Error(
      `SAMP API HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Format data SAMP tidak valid."
    );
  }

  return data;
}

// ========================================
// BUILD COMPONENTS V2
// ========================================

function buildSampComponents(servers) {

  const container =
    new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "# 🎮 MONROE SAMP SERVER LIST\n" +
      "Live server information"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  if (!servers.length) {

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "⚠️ Tidak ada server yang tersedia."
      )
    );

  } else {

    const list =
      servers
        .slice(0, 15)
        .map((server, index) => {

          const players =
            Number(
              server.players ?? 0
            );

          const maxPlayers =
            Number(
              server.maxPlayers ??
              server.maxplayers ??
              0
            );

          const online =
            server.online !== false;

          const status =
            online
              ? "🟢"
              : "🔴";

          const hostname =
            server.hostname ||
            server.name ||
            "Unknown Server";

          const ip =
            server.ip ||
            server.address ||
            "Unknown";

          const version =
            server.version ||
            server.versionName ||
            "Unknown";

          return (
            `**${index + 1}. ${hostname}**\n` +
            `${status} **${players}/${maxPlayers} Players**\n` +
            `📡 \`${ip}\`\n` +
            `🎮 ${version}`
          );

        });

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        list.join("\n\n")
      )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🔄 Updated: <t:${Math.floor(
        Date.now() / 1000
      )}:R>\n` +
      `📊 Showing ${Math.min(
        servers.length,
        15
      )} server(s)`
    )
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

  container.addActionRowComponents(
    new ActionRowBuilder()
      .addComponents(
        refreshButton
      )
  );

  return container;
}

// ========================================
// UPDATE PANEL
// ========================================

async function updateSampPanel(client) {

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

    const components =
      buildSampComponents(
        servers
      );

    const messages =
      await channel.messages.fetch({
        limit: 10
      });

    const existing =
      messages.find(
        message =>
          message.author.id ===
          client.user.id
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

    console.log(
      `🎮 SAMP list updated: ${servers.length} server(s)`
    );

  } catch (error) {

    console.error(
      "❌ SAMP update error:",
      error
    );

  }
}

// ========================================
// START SYSTEM
// ========================================

function startSampSystem(client) {

  updateSampPanel(client);

  setInterval(
    () => {
      updateSampPanel(client);
    },
    UPDATE_INTERVAL
  );

}

// ========================================
// REFRESH BUTTON
// ========================================

async function handleSampInteraction(
  interaction
) {

  if (
    !interaction.isButton() ||
    interaction.customId !==
      "monroe_samp_refresh"
  ) {

    return false;
  }

  await interaction.deferUpdate();

  await updateSampPanel(
    interaction.client
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