const {
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

async function handleModeration(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (!message.content.startsWith("!")) return;

  const member = message.member;

  if (!isStaff(member)) {
    return message.reply(
      "perintah akan segera dilaksanakan."
    );
  }

  const args = message.content.trim().split(/\s+/);
  const command = args[0].toLowerCase();

  // =========================
  // !clear
  // =========================

  if (command === "!clear") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Manage Messages**."
      );
    }

    const amount = parseInt(args[1]);

    if (!amount || amount < 1 || amount > 100) {
      return message.reply(
        "❌ Gunakan: `!clear 1-100`"
      );
    }

    await message.delete().catch(() => {});

    const deleted = await message.channel.bulkDelete(
      amount,
      true
    );

    const msg = await message.channel.send(
      `🧹 Berhasil menghapus **${deleted.size} pesan**.`
    );

    setTimeout(() => {
      msg.delete().catch(() => {});
    }, 3000);

    return;
  }

  // =========================
  // !kickm
  // =========================

  if (command === "!kickm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Kick Members**."
      );
    }

    const target =
      message.mentions.members.first();

    if (!target) {
      return message.reply(
        "❌ Gunakan: `!kickm @member alasan`"
      );
    }

    const reason =
      args.slice(2).join(" ") ||
      "Tidak ada alasan";

    if (!target.kickable) {
      return message.reply(
        "❌ Member tersebut tidak bisa di-kick."
      );
    }

    await target.kick(reason);

    return message.reply(
      `👢 **${target.user.tag}** berhasil di-kick.\nAlasan: ${reason}`
    );
  }

  // =========================
  // !banm
  // =========================

  if (command === "!banm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.BanMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Ban Members**."
      );
    }

    const target =
      message.mentions.members.first();

    if (!target) {
      return message.reply(
        "❌ Gunakan: `!banm @member alasan`"
      );
    }

    const reason =
      args.slice(2).join(" ") ||
      "Tidak ada alasan";

    if (!target.bannable) {
      return message.reply(
        "❌ Member tersebut tidak bisa di-ban."
      );
    }

    await target.ban({
      reason
    });

    return message.reply(
      `🔨 **${target.user.tag}** berhasil di-ban.\nAlasan: ${reason}`
    );
  }

  // =========================
  // !tom
  // =========================

  if (command === "!tom") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Moderate Members**."
      );
    }

    const target =
      message.mentions.members.first();

    const durationText = args[2];

    if (!target || !durationText) {
      return message.reply(
        "❌ Gunakan: `!tom @member 10m alasan`"
      );
    }

    const match =
      durationText.match(
        /^(\d+)(s|m|h|d)$/i
      );

    if (!match) {
      return message.reply(
        "❌ Format waktu: `10s`, `10m`, `2h`, atau `1d`."
      );
    }

    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();

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
      return message.reply(
        "❌ Maksimal timeout adalah **28 hari**."
      );
    }

    const reason =
      args.slice(3).join(" ") ||
      "Tidak ada alasan";

    if (!target.moderatable) {
      return message.reply(
        "❌ Member tersebut tidak bisa di-timeout."
      );
    }

    await target.timeout(
      duration,
      reason
    );

    return message.reply(
      `⏱️ **${target.user.tag}** mendapatkan timeout **${durationText}**.\nAlasan: ${reason}`
    );
  }

  // =========================
  // !lockm
  // =========================

  if (command === "!lockm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Manage Channels**."
      );
    }

    await message.channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    return message.reply(
      "🔒 Channel berhasil di-lock."
    );
  }

  // =========================
  // !unlockm
  // =========================

  if (command === "!unlockm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Manage Channels**."
      );
    }

    await message.channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      {
        SendMessages: null
      }
    );

    return message.reply(
      "🔓 Channel berhasil di-unlock."
    );
  }

  // =========================
  // !warnm
  // =========================

  if (command === "!warnm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Moderate Members**."
      );
    }

    const target =
      message.mentions.members.first();

    if (!target) {
      return message.reply(
        "❌ Gunakan: `!warnm @member alasan`"
      );
    }

    const reason =
      args.slice(2).join(" ") ||
      "Tidak ada alasan";

    return message.reply(
      `⚠️ **${target.user.tag}** mendapatkan peringatan.\nAlasan: ${reason}`
    );
  }
}

module.exports = {
  handleModeration
};