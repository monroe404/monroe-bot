const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

// ========================================
// CONFIG
// ========================================

const FREE_ROLE_CHANNEL_ID =
  "1550719481628856340";

// ========================================
// SERVER ROLE
// ========================================

const SERVER_ROLES = [
  {
    id: "1553280859434651761",
    name: "State Side #SSRP!!",
    emoji: "🎮"
  },
  {
    id: "1553280978573856778",
    name: "Crystal Pride #CPRP!!",
    emoji: "💎"
  },
  {
    id: "1553281129044385843",
    name: "JogjaGamers #JGRP!!",
    emoji: "🌆"
  },
  {
    id: "1553281313665060904",
    name: "Lunar Pride #LPRP!!",
    emoji: "🌙"
  },
  {
    id: "1553442208185843744",
    name: "Grand Country #GCRP!!",
    emoji: "🏙️"
  },
  {
    id: "1553575984932978762",
    name: "Valiant #VRP!!",
    emoji: "🛡️"
  }
];

// ========================================
// GAME PLAYING
// ========================================

const GAME_ROLES = [
  {
    id: "1553442336774693024",
    name: "Roblox Player",
    emoji: "🎮"
  },
  {
    id: "1553442538013065296",
    name: "Minecraft Player",
    emoji: "⛏️"
  },
  {
    id: "1553580616392384643",
    name: "Free Fire Player",
    emoji: "🔥"
  }
];

// ========================================
// IC ROLE
// ========================================

const IC_ROLES = [
  {
    id: "1553581299963273236",
    name: "Police Department",
    emoji: "👮"
  },
  {
    id: "1553581412588855356",
    name: "Fire Department",
    emoji: "🚒"
  },
  {
    id: "1553581515630186556",
    name: "Government State",
    emoji: "🏛️"
  },
  {
    id: "1553581641178284074",
    name: "News Agency",
    emoji: "📰"
  },
  {
    id: "1553582104653340692",
    name: "Families And Gangs",
    emoji: "🔫"
  },
  {
    id: "1553442735107870750",
    name: "Robbery",
    emoji: "💰"
  }
];

// ========================================
// ALL ROLES
// ========================================

const ALL_ROLES = [
  ...SERVER_ROLES,
  ...GAME_ROLES,
  ...IC_ROLES
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
// SEND MAIN PANEL
// ========================================

async function sendFreeRolePanel(client) {
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
        .setTitle("FREE ROLE")
        .setDescription(
          [
            "Pilih kategori role yang ingin kamu ambil.",
            "",
            "🎭 **SERVER ROLE**",
            "Pilih role server yang kamu mainkan.",
            "",
            "🎮 **GAME PLAYING**",
            "Pilih game yang sedang kamu mainkan.",
            "",
            "🪪 **IC ROLE**",
            "Pilih role IC kamu."
          ].join("\n")
        )
        .setFooter({
          text:
            "MONROE COMMUNITY © 2026"
        });

    const row =
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(
              "free_role_category_server"
            )
            .setLabel("SERVER ROLE")
            .setEmoji("🎭")
            .setStyle(
              ButtonStyle.Secondary
            ),

          new ButtonBuilder()
            .setCustomId(
              "free_role_category_game"
            )
            .setLabel("GAME PLAYING")
            .setEmoji("🎮")
            .setStyle(
              ButtonStyle.Secondary
            ),

          new ButtonBuilder()
            .setCustomId(
              "free_role_category_ic"
            )
            .setLabel("IC ROLE")
            .setEmoji("🪪")
            .setStyle(
              ButtonStyle.Secondary
            )
        );

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
    return false;
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

  return true;
}

// ========================================
// CREATE SELECT MENU
// ========================================

function createRoleSelect(
  category,
  roles
) {
  const select =
    new StringSelectMenuBuilder()
      .setCustomId(
        `free_role_select_${category}`
      )
      .setPlaceholder(
        "👇 Pilih role kamu di sini"
      )
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        roles.map(role => ({
          label: role.name,
          value: role.id,
          emoji: role.emoji
        }))
      );

  return new ActionRowBuilder()
    .addComponents(select);
}

// ========================================
// HANDLE INTERACTION
// ========================================

async function handleFreeRoleInteraction(
  interaction
) {

  // ======================================
  // CATEGORY BUTTON
  // ======================================

  if (interaction.isButton()) {

    let category = null;
    let roles = null;
    let title = "";

    if (
      interaction.customId ===
      "free_role_category_server"
    ) {
      category = "server";
      roles = SERVER_ROLES;
      title = "🎭 SERVER ROLE";
    }

    if (
      interaction.customId ===
      "free_role_category_game"
    ) {
      category = "game";
      roles = GAME_ROLES;
      title = "🎮 GAME PLAYING";
    }

    if (
      interaction.customId ===
      "free_role_category_ic"
    ) {
      category = "ic";
      roles = IC_ROLES;
      title = "🪪 IC ROLE";
    }

    if (!category) {
      return false;
    }

    const embed =
      new EmbedBuilder()
        .setColor(0xFF7A00)
        .setTitle(title)
        .setDescription(
          "👇 Pilih role yang ingin kamu ambil di bawah."
        )
        .setFooter({
          text:
            "MONROE COMMUNITY © 2026"
        });

    await interaction.reply({
      embeds: [embed],
      components: [
        createRoleSelect(
          category,
          roles
        )
      ],
      ephemeral: true
    });

    return true;
  }

  // ======================================
  // SELECT MENU
  // ======================================

  if (
    interaction.isStringSelectMenu()
  ) {

    if (
      !interaction.customId.startsWith(
        "free_role_select_"
      )
    ) {
      return false;
    }

    const roleId =
      interaction.values[0];

    const role =
      ALL_ROLES.find(
        item =>
          item.id === roleId
      );

    if (!role) {
      await interaction.reply({
        content:
          "❌ Role tidak ditemukan.",
        ephemeral: true
      });

      return true;
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

      // ==================================
      // CHECK ROLE
      // ==================================

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

      // ==================================
      // FETCH ROLE
      // ==================================

      const guildRole =
        await interaction.guild.roles.fetch(
          role.id
        );

      if (!guildRole) {
        await interaction.reply({
          content:
            "❌ Role tidak ditemukan di server.",
          ephemeral: true
        });

        return true;
      }

      // ==================================
      // GIVE ROLE
      // ==================================

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

  return false;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  freeRoleCommand,
  sendFreeRolePanel,
  handleFreeRoleCommand,
  handleFreeRoleInteraction
};e =
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