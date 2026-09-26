const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const {
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID
} = require("../config");

function isStaff(member) {
  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID)
  );
}

// =========================
// MODERATION COMMANDS
// =========================

const moderationCommands = [
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Menghapus pesan di channel.")
    .addIntegerOption(option =>
      option
        .setName("jumlah")
        .setDescription("Jumlah pesan yang ingin dihapus (1-100).")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  new SlashCommandBuilder()
    .setName("kickm")
    .setDescription("Kick member dari server.")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("Member yang ingin di-kick.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("alasan")
        .setDescription("Alasan kick.")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("banm")
    .setDescription("Ban member dari server.")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("Member yang ingin di-ban.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("alasan")
        .setDescription("Alasan ban.")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("tom")
    .setDescription("Memberikan timeout kepada member.")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("Member yang ingin di-timeout.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("durasi")
        .setDescription("Contoh: 10s, 10m, 2h, 1d.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("alasan")
        .setDescription("Alasan timeout.")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("lockm")
    .setDescription("Mengunci channel."),

  new SlashCommandBuilder()
    .setName("unlockm")
    .setDescription("Membuka kembali channel."),

  new SlashCommandBuilder()
    .setName("warnm")
    .setDescription("Memberikan peringatan kepada member.")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("Member yang ingin diberi peringatan.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("alasan")
        .setDescription("Alasan peringatan.")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("rolem")
    .setDescription("Memberikan role kepada member.")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("Member yang ingin diberi role.")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Role yang ingin diberikan.")
        .setRequired(true)
    )
].map(command => command.toJSON());


// =========================
// HANDLE MODERATION
// =========================

async function handleModerationInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return false;

  const commands = [
    "clear",
    "kickm",
    "banm",
    "tom",
    "lockm",
    "unlockm",
    "warnm",
    "rolem"
  ];

  if (!commands.includes(interaction.commandName)) {
    return false;
  }

  if (!interaction.guild || !interaction.member) {
    await interaction.reply({
      content: "❌ Command hanya dapat digunakan di server.",
      ephemeral: true
    });

    return true;
  }

  // =========================
  // STAFF CHECK
  // =========================

  if (!isStaff(interaction.member)) {
    await interaction.reply({
      content: "perintah akan segera dilaksanakan.",
      ephemeral: true
    });

    return true;
  }

  // =========================
  // /clear
  // =========================

  if (interaction.commandName === "clear") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Manage Messages**.",
        ephemeral: true
      });

      return true;
    }

    const amount =
      interaction.options.getInteger("jumlah");

    await interaction.deferReply({
      ephemeral: true
    });

    try {
      const deleted =
        await interaction.channel.bulkDelete(
          amount,
          true
        );

      await interaction.editReply({
        content:
          `🧹 Berhasil menghapus **${deleted.size} pesan**.`
      });
    } catch (error) {
      console.error("❌ Clear Error:", error);

      await interaction.editReply({
        content:
          "❌ Gagal menghapus pesan."
      });
    }

    return true;
  }

  // =========================
  // /kickm
  // =========================

  if (interaction.commandName === "kickm") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Kick Members**.",
        ephemeral: true
      });

      return true;
    }

    const target =
      interaction.options.getMember("member");

    const reason =
      interaction.options.getString("alasan") ||
      "Tidak ada alasan";

    if (!target) {
      await interaction.reply({
        content:
          "❌ Member tidak ditemukan.",
        ephemeral: true
      });

      return true;
    }

    if (!target.kickable) {
      await interaction.reply({
        content:
          "❌ Member tersebut tidak bisa di-kick.",
        ephemeral: true
      });

      return true;
    }

    try {
      await target.kick(reason);

      await interaction.reply({
        content:
          `👢 **${target.user.tag}** berhasil di-kick.\nAlasan: ${reason}`
      });
    } catch (error) {
      console.error("❌ Kick Error:", error);

      await interaction.reply({
        content:
          "❌ Gagal melakukan kick.",
        ephemeral: true
      });
    }

    return true;
  }

  // =========================
  // /banm
  // =========================

  if (interaction.commandName === "banm") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.BanMembers
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Ban Members**.",
        ephemeral: true
      });

      return true;
    }

    const target =
      interaction.options.getMember("member");

    const reason =
      interaction.options.getString("alasan") ||
      "Tidak ada alasan";

    if (!target) {
      await interaction.reply({
        content:
          "❌ Member tidak ditemukan.",
        ephemeral: true
      });

      return true;
    }

    if (!target.bannable) {
      await interaction.reply({
        content:
          "❌ Member tersebut tidak bisa di-ban.",
        ephemeral: true
      });

      return true;
    }

    try {
      await target.ban({
        reason
      });

      await interaction.reply({
        content:
          `🔨 **${target.user.tag}** berhasil di-ban.\nAlasan: ${reason}`
      });
    } catch (error) {
      console.error("❌ Ban Error:", error);

      await interaction.reply({
        content:
          "❌ Gagal melakukan ban.",
        ephemeral: true
      });
    }

    return true;
  }

  // =========================
  // /tom
  // =========================

  if (interaction.commandName === "tom") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Moderate Members**.",
        ephemeral: true
      });

      return true;
    }

    const target =
      interaction.options.getMember("member");

    const durationText =
      interaction.options.getString("durasi");

    const reason =
      interaction.options.getString("alasan") ||
      "Tidak ada alasan";

    if (!target || !durationText) {
      await interaction.reply({
        content:
          "❌ Member dan durasi wajib diisi.",
        ephemeral: true
      });

      return true;
    }

    const match =
      durationText.match(
        /^(\d+)(s|m|h|d)$/i
      );

    if (!match) {
      await interaction.reply({
        content:
          "❌ Format waktu: `10s`, `10m`, `2h`, atau `1d`.",
        ephemeral: true
      });

      return true;
    }

    const amount =
      parseInt(match[1]);

    const unit =
      match[2].toLowerCase();

    let duration;

    if (unit === "s")
      duration = amount * 1000;

    if (unit === "m")
      duration = amount * 60 * 1000;

    if (unit === "h")
      duration = amount * 60 * 60 * 1000;

    if (unit === "d")
      duration = amount * 24 * 60 * 60 * 1000;

    const maxDuration =
      28 * 24 * 60 * 60 * 1000;

    if (duration > maxDuration) {
      await interaction.reply({
        content:
          "❌ Maksimal timeout adalah **28 hari**.",
        ephemeral: true
      });

      return true;
    }

    if (!target.moderatable) {
      await interaction.reply({
        content:
          "❌ Member tersebut tidak bisa di-timeout.",
        ephemeral: true
      });

      return true;
    }

    try {
      await target.timeout(
        duration,
        reason
      );

      await interaction.reply({
        content:
          `⏱️ **${target.user.tag}** mendapatkan timeout **${durationText}**.\nAlasan: ${reason}`
      });
    } catch (error) {
      console.error("❌ Timeout Error:", error);

      await interaction.reply({
        content:
          "❌ Gagal memberikan timeout.",
        ephemeral: true
      });
    }

    return true;
  }

  // =========================
  // /lockm
  // =========================

  if (interaction.commandName === "lockm") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Manage Channels**.",
        ephemeral: true
      });

      return true;
    }

    try {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: false
        }
      );

      await interaction.reply({
        content:
          "🔒 Channel berhasil di-lock."
      });
    } catch (error) {
      console.error("❌ Lock Error:", error);

      await interaction.reply({
        content:
          "❌ Gagal mengunci channel.",
        ephemeral: true
      });
    }

    return true;
  }

  // =========================
  // /unlockm
  // =========================

  if (interaction.commandName === "unlockm") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Manage Channels**.",
        ephemeral: true
      });

      return true;
    }

    try {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: null
        }
      );

      await interaction.reply({
        content:
          "🔓 Channel berhasil di-unlock."
      });
    } catch (error) {
      console.error("❌ Unlock Error:", error);

      await interaction.reply({
        content:
          "❌ Gagal membuka channel.",
        ephemeral: true
      });
    }

    return true;
  }

  // =========================
  // /warnm
  // =========================

  if (interaction.commandName === "warnm") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Moderate Members**.",
        ephemeral: true
      });

      return true;
    }

    const target =
      interaction.options.getMember("member");

    const reason =
      interaction.options.getString("alasan") ||
      "Tidak ada alasan";

    if (!target) {
      await interaction.reply({
        content:
          "❌ Member tidak ditemukan.",
        ephemeral: true
      });

      return true;
    }

    await interaction.reply({
      content:
        `⚠️ **${target.user.tag}** mendapatkan peringatan.\nAlasan: ${reason}`
    });

    return true;
  }

  // =========================
  // /rolem
  // =========================

  if (interaction.commandName === "rolem") {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageRoles
      )
    ) {
      await interaction.reply({
        content:
          "❌ Kamu tidak mempunyai permission **Manage Roles**.",
        ephemeral: true
      });

      return true;
    }

    const target =
      interaction.options.getMember("member");

    const role =
      interaction.options.getRole("role");

    if (!target || !role) {
      await interaction.reply({
        content:
          "❌ Member atau role tidak ditemukan.",
        ephemeral: true
      });

      return true;
    }

    if (role.managed) {
      await interaction.reply({
        content:
          "❌ Role tersebut dikelola oleh integrasi dan tidak dapat diberikan.",
        ephemeral: true
      });

      return true;
    }

    const botMember =
      interaction.guild.members.me;

    if (
      role.position >=
      botMember.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "❌ Role tersebut berada di atas atau sama dengan role bot.",
        ephemeral: true
      });

      return true;
    }

    try {
      await target.roles.add(role);

      await interaction.reply({
        content:
          `✅ Role **${role.name}** berhasil diberikan kepada **${target.user.tag}**.`
      });
    } catch (error) {
      console.error("❌ Role Error:", error);

      await interaction.reply({
        content:
          "❌ Gagal memberikan role.",
        ephemeral: true
      });
    }

    return true;
  }

  return true;
}

module.exports = {
  moderationCommands,
  handleModerationInteraction
};