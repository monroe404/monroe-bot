const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

const {
  GUILD_ID,
  HUMAN_ROLE_ID,
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID
} = require("../config");

const roleCommand = new SlashCommandBuilder()
  .setName("setup-role")
  .setDescription("Membuat panel Take Role")
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Pilih channel untuk panel Take Role")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );

async function handleRoleFeature(interaction) {
  // =========================
  // /setup-role
  // =========================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === "setup-role"
  ) {
    if (interaction.guildId !== GUILD_ID) {
      return interaction.reply({
        content: "❌ Command ini tidak tersedia di server ini.",
        ephemeral: true
      });
    }

    const member = interaction.member;

    const isStaff =
      member.roles.cache.has(STAFF_ROLE_ID) ||
      member.roles.cache.has(FOUNDER_ROLE_ID);

    if (!isStaff) {
      return interaction.reply({
        content: "❌ Kamu tidak mempunyai akses untuk menggunakan command ini.",
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel("channel");

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "❌ Pilih channel text yang valid.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xff8c00)
      .setTitle("🟧 MONROE COMMUNITY")
      .setDescription(
        "👤 **MEMBER VERIFICATION**\n\n" +
        "Welcome to **Monroe Community**.\n\n" +
        "Untuk mengakses seluruh server, silakan\n" +
        "ambil role dengan menekan tombol di bawah.\n\n" +
        "🔓 **VERIFY YOURSELF**\n" +
        "Klik tombol di bawah untuk mendapatkan role.\n\n" +
        "MONROE COMMUNITY © 2026"
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("human_role")
        .setLabel("TAKE ROLE")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content: `✅ Panel Take Role berhasil dikirim ke ${channel}.`,
      ephemeral: true
    });
  }

  // =========================
  // BUTTON TAKE ROLE
  // =========================

  if (
    interaction.isButton() &&
    interaction.customId === "human_role"
  ) {
    if (interaction.guildId !== GUILD_ID) return;

    try {
      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      const role = interaction.guild.roles.cache.get(
        HUMAN_ROLE_ID
      );

      if (!role) {
        return interaction.reply({
          content: "❌ Role Human tidak ditemukan.",
          ephemeral: true
        });
      }

      if (member.roles.cache.has(HUMAN_ROLE_ID)) {
        return interaction.reply({
          content: "ℹ️ Kamu sudah memiliki role **Human**.",
          ephemeral: true
        });
      }

      await member.roles.add(role);

      return interaction.reply({
        content: "✅ Role **Human** berhasil diberikan!",
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Error Take Role:", error);

      return interaction.reply({
        content:
          "❌ Gagal memberikan role. Pastikan role bot berada **di atas role Human** dan bot mempunyai permission **Manage Roles**.",
        ephemeral: true
      });
    }
  }
}

module.exports = {
  roleCommand,
  handleRoleFeature
};
