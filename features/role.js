const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require("discord.js");

const {
  GUILD_ID,
  HUMAN_ROLE_ID,
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID
} = require("../config");

// =========================
// MONROE LOGO
// =========================

const MONROE_LOGO =
  "https://cdn.discordapp.com/attachments/1528188606663884853/1551251020544344134/Tak_berjudul41_20260920221708.jpg?ex=6ab14a98&is=6aaff918&hm=6cdee5dcc024eb0d3fcf2ee06315e2991dc407ef58bb4b9579c52e1ca4aee0ec&";

// =========================
// SLASH COMMAND
// =========================

const roleCommand = new SlashCommandBuilder()
  .setName("setup-role")
  .setDescription("Membuat panel Verified Role")
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Pilih channel untuk panel Verified Role")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );

// =========================
// HANDLE ROLE FEATURE
// =========================

async function handleRoleFeature(interaction) {

  // =========================
  // SETUP ROLE PANEL
  // =========================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === "setup-role"
  ) {

    if (interaction.guildId !== GUILD_ID) {
      return interaction.reply({
        content:
          "❌ Command ini tidak tersedia di server ini.",
        ephemeral: true
      });
    }

    const member = interaction.member;

    const isStaff =
      member.roles.cache.has(STAFF_ROLE_ID) ||
      member.roles.cache.has(FOUNDER_ROLE_ID);

    if (!isStaff) {
      return interaction.reply({
        content:
          "❌ Kamu tidak mempunyai akses untuk menggunakan command ini.",
        ephemeral: true
      });
    }

    const channel =
      interaction.options.getChannel("channel");

    if (
      !channel ||
      channel.type !== ChannelType.GuildText
    ) {
      return interaction.reply({
        content:
          "❌ Pilih channel text yang valid.",
        ephemeral: true
      });
    }

    // =========================
    // VERIFIED ROLE BUTTON
    // =========================

    const verifiedButton =
      new ButtonBuilder()
        .setCustomId("human_role")
        .setLabel("VERIFIED ROLE")
        .setEmoji("🎲")
        .setStyle(ButtonStyle.Primary);

    const buttonRow =
      new ActionRowBuilder()
        .addComponents(verifiedButton);

    // =========================
    // PANEL
    // =========================

    const container =
      new ContainerBuilder()
        .setAccentColor(0xff8c00)

        // =========================
        // TITLE + DESCRIPTION
        // =========================

        .addTextDisplayComponents(
          text =>
            text.setContent(
              "## MEMBER VERIFICATION\n\n" +

              "Welcome to **Monroe Community**.\n\n" +

              "Untuk mengakses seluruh fitur dan channel\n" +
              "server, silakan melakukan verification terlebih dahulu.\n\n" +

              "**🔓 VERIFICATION**\n" +
              "Klik tombol **VERIFIED ROLE** di bawah\n" +
              "untuk mendapatkan role member.\n\n" +

              "Setelah berhasil melakukan verification,\n" +
              "kamu dapat mengakses channel yang tersedia."
            )
        )

        // =========================
        // SEPARATOR
        // =========================

        .addSeparatorComponents(
          separator => separator
        )

        // =========================
        // BUTTON
        // =========================

        .addActionRowComponents(buttonRow)

        // =========================
        // FOOTER
        // =========================

        .addTextDisplayComponents(
          text =>
            text.setContent(
              "\n-# MONROE COMMUNITY © 2026"
            )
        )

        // =========================
        // LOGO DI BAWAH
        // =========================

        .addMediaGalleryComponents(
          gallery =>
            gallery.addItems(
              new MediaGalleryItemBuilder()
                .setURL(MONROE_LOGO)
            )
        );

    // =========================
    // SEND PANEL
    // =========================

    await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    return interaction.reply({
      content:
        `✅ Panel Verified Role berhasil dikirim ke ${channel}.`,
      ephemeral: true
    });
  }

  // =========================
  // VERIFIED ROLE BUTTON
  // =========================

  if (
    interaction.isButton() &&
    interaction.customId === "human_role"
  ) {

    if (interaction.guildId !== GUILD_ID) {
      return;
    }

    try {

      const member =
        await interaction.guild.members.fetch(
          interaction.user.id
        );

      const role =
        interaction.guild.roles.cache.get(
          HUMAN_ROLE_ID
        );

      // =========================
      // ROLE NOT FOUND
      // =========================

      if (!role) {
        return interaction.reply({
          content:
            "❌ Role Human tidak ditemukan.",
          ephemeral: true
        });
      }

      // =========================
      // ALREADY VERIFIED
      // =========================

      if (
        member.roles.cache.has(HUMAN_ROLE_ID)
      ) {
        return interaction.reply({
          content:
            "ℹ️ Kamu sudah memiliki role **Human**.",
          ephemeral: true
        });
      }

      // =========================
      // GIVE ROLE
      // =========================

      await member.roles.add(role);

      return interaction.reply({
        content:
          "✅ **VERIFIED ROLE** berhasil diberikan!\nSelamat datang di Monroe Community.",
        ephemeral: true
      });

    } catch (error) {

      console.error(
        "❌ Error Verified Role:",
        error
      );

      return interaction.reply({
        content:
          "❌ Gagal memberikan role. Pastikan role bot berada **di atas role Human** dan bot mempunyai permission **Manage Roles**.",
        ephemeral: true
      });
    }
  }
}

// =========================
// EXPORT
// =========================

module.exports = {
  roleCommand,
  handleRoleFeature
};
