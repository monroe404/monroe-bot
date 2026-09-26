const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// ========================================
// CONFIG
// ========================================

const FREE_ROLE_CHANNEL_ID =
  "1550719481628856340";

const FREE_ROLES = [
  {
    id: "1553280859434651761",
    name: "State Side #SSRP!!",
    emoji: "🎮",
    buttonId: "free_role_ssrp"
  },
  {
    id: "1553280978573856778",
    name: "Crystal Pride #CPRP!!",
    emoji: "💎",
    buttonId: "free_role_cprp"
  },
  {
    id: "1553281129044385843",
    name: "JogjaGamers #JGRP!!",
    emoji: "🌆",
    buttonId: "free_role_jgrp"
  },
  {
    id: "1553281313665060904",
    name: "Lunar Pride #LPRP!!",
    emoji: "🌙",
    buttonId: "free_role_lprp"
  }
];

// ========================================
// SLASH COMMAND
// ========================================

const freeRoleCommand =
  new SlashCommandBuilder()
    .setName("setup-free-role")
    .setDescription(
      "Mengirim panel Free Role."
    );

// ========================================
// SEND PANEL
// ========================================

async function sendFreeRolePanel(
  client
) {
  try {
    const channel =
      await client.channels.fetch(
        FREE_ROLE_CHANNEL_ID
      );

    if (!channel) {
      console.error(
        "❌ Channel Free Role tidak ditemukan."
      );
      return;
    }

    const embed =
      new EmbedBuilder()
        .setColor(0xFF7A00)
        .setTitle(
          "🟧 FREE ROLE"
        )
        .setDescription(
          [
            "Dapatkan role server secara gratis.",
            "",
            "Pilih role yang ingin kamu ambil dengan menekan tombol di bawah.",
            "",
            "Setiap role dapat diklaim secara bebas."
          ].join("\n")
        )
        .setFooter({
          text:
            "MONROE COMMUNITY © 2026"
        });

    const row =
      new ActionRowBuilder();

    for (const role of FREE_ROLES) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(
            role.buttonId
          )
          .setLabel(
            role.name
          )
          .setEmoji(
            role.emoji
          )
          .setStyle(
            ButtonStyle.Secondary
          )
      );
    }

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    console.log(
      "✅ Panel Free Role berhasil dikirim."
    );

  } catch (error) {
    console.error(
      "❌ Gagal mengirim panel Free Role:",
      error
    );
  }
}

// ========================================
// HANDLE COMMAND
// ========================================

async function handleFreeRoleCommand(
  interaction
) {
  if (
    interaction.commandName !==
    "setup-free-role"
  ) {
    return;
  }

  await interaction.deferReply({
    ephemeral: true
  });

  await sendFreeRolePanel(
    interaction.client
  );

  await interaction.editReply({
    content:
      "✅ Panel Free Role berhasil dikirim."
  });
}

// ========================================
// HANDLE BUTTON
// ========================================

async function handleFreeRoleInteraction(
  interaction
) {
  if (!interaction.isButton()) {
    return false;
  }

  const role =
    FREE_ROLES.find(
      item =>
        item.buttonId ===
        interaction.customId
    );

  if (!role) {
    return false;
  }

  try {
    const member =
      interaction.member;

    if (!member) {
      await interaction.reply({
        content:
          "❌ Data member tidak ditemukan.",
        ephemeral: true
      });

      return true;
    }

    // ====================================
    // CHECK ROLE
    // ====================================

    if (
      member.roles.cache.has(
        role.id
      )
    ) {
      await interaction.reply({
        content:
          `⚠️ Kamu sudah memiliki role **${role.name}**.`,
        ephemeral: true
      });

      return true;
    }

    // ====================================
    // FETCH ROLE
    // ====================================

    const guildRole =
      await interaction.guild.roles.fetch(
        role.id
      );

    if (!guildRole) {
      await interaction.reply({
        content:
          "❌ Role tidak ditemukan.",
        ephemeral: true
      });

      return true;
    }

    // ====================================
    // ADD ROLE
    // ====================================

    await member.roles.add(
      guildRole
    );

    await interaction.reply({
      content:
        `✅ Berhasil mendapatkan role **${role.name}**!`,
      ephemeral: true
    });

    console.log(
      `🎁 ${interaction.user.tag} mendapatkan role ${role.name}`
    );

    return true;

  } catch (error) {
    console.error(
      "❌ Free Role Error:",
      error
    );

    if (
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content:
          "❌ Gagal memberikan role. Pastikan posisi role bot lebih tinggi dari role tersebut.",
        ephemeral: true
      });
    }

    return true;
  }
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  freeRoleCommand,
  sendFreeRolePanel,
  handleFreeRoleCommand,
  handleFreeRoleInteraction
};