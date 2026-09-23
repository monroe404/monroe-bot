const {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require("discord.js");

const {
  HUMAN_ROLE_ID,
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID
} = require("../config");

// ==========================================
// SETTINGS
// ==========================================

const PRAYER_METHOD = 20;
const NOTICE_EXPIRE_HOURS = 3;

const prayerNames = {
  Fajr: "Subuh",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya"
};

const prayerOrder = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha"
];

const quotes = {
  Fajr:
    "Awali hari dengan mengingat Allah dan menunaikan kewajiban kepada-Nya.",

  Dhuhr:
    "Di tengah kesibukan, jangan lupakan waktu untuk berhenti dan menghadap kepada Allah.",

  Asr:
    "Jangan biarkan kesibukan membuat kita lalai dari kewajiban.",

  Maghrib:
    "Saat matahari terbenam, mari luangkan waktu untuk menunaikan sholat Maghrib.",

  Isha:
    "Tutup hari dengan sholat dan mengingat Allah sebelum beristirahat."
};

// ==========================================
// SLASH COMMAND
// ==========================================

const prayerCommand =
  new SlashCommandBuilder()
    .setName("setup-prayer")
    .setDescription(
      "Setup sistem jadwal dan notifikasi sholat."
    )
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription(
          "Channel khusus jadwal sholat."
        )
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("location")
        .setDescription(
          "Kota/kabupaten di Indonesia. Contoh: Bandung, Indonesia"
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    );

// ==========================================
// PERMISSION
// ==========================================

function canManagePrayer(member) {
  if (!member) return false;

  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID) ||
    member.permissions.has(
      PermissionFlagsBits.Administrator
    )
  );
}

// ==========================================
// API
// ==========================================

async function getPrayerTimes(location) {
  const date = new Date();

  const day =
    String(date.getDate()).padStart(2, "0");

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const year =
    date.getFullYear();

  const address =
    encodeURIComponent(location);

  const url =
    `https://api.aladhan.com/v1/timingsByAddress/` +
    `${day}-${month}-${year}` +
    `?address=${address}` +
    `&country=Indonesia` +
    `&method=${PRAYER_METHOD}`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Prayer API HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    data.code !== 200 ||
    !data.data?.timings
  ) {
    throw new Error(
      "Prayer API returned invalid data."
    );
  }

  return data.data;
}

// ==========================================
// TIME HELPERS
// ==========================================

function timeToMinutes(time) {
  const [hour, minute] =
    time.split(":").map(Number);

  return (
    hour * 60 +
    minute
  );
}

function getCurrentMinutes() {
  const now = new Date();

  return (
    now.getHours() * 60 +
    now.getMinutes()
  );
}

function formatDateIndonesia() {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(new Date());
}

// ==========================================
// EMBEDS
// ==========================================

function createScheduleEmbed(
  location,
  timings
) {
  const lines =
    prayerOrder.map(prayer => {
      const time =
        timings[prayer];

      return (
        `**${prayerNames[prayer]}**` +
        ` — \`${time}\``
      );
    });

  return new EmbedBuilder()
    .setColor(0xF97316)
    .setTitle("JADWAL SHOLAT")
    .setDescription(
      `**Lokasi:** ${location}\n` +
      `**Tanggal:** ${formatDateIndonesia()}\n\n` +
      lines.join("\n")
    )
    .setFooter({
      text:
        "MONROE COMMUNITY © 2026"
    });
}

function createNoticeEmbed(
  location,
  prayer,
  time
) {
  return new EmbedBuilder()
    .setColor(0xF97316)
    .setTitle(
      `WAKTU ${prayerNames[prayer].toUpperCase()}`
    )
    .setDescription(
      `Saatnya menunaikan sholat **${
        prayerNames[prayer]
      }**.\n\n` +
      `"${quotes[prayer]}"\n\n` +
      `**Lokasi:** ${location}\n` +
      `**Waktu:** ${time}`
    )
    .setFooter({
      text:
        "MONROE COMMUNITY © 2026"
    });
}

// ==========================================
// MESSAGE FINDER
// ==========================================

async function findPrayerMessages(channel) {
  const messages =
    await channel.messages.fetch({
      limit: 50
    });

  let scheduleMessage = null;
  let noticeMessage = null;

  for (const message of messages.values()) {
    if (
      message.author.bot &&
      message.embeds.length
    ) {
      const title =
        message.embeds[0].title || "";

      if (
        title === "JADWAL SHOLAT"
      ) {
        scheduleMessage = message;
      }

      if (
        title.startsWith(
          "WAKTU "
        )
      ) {
        noticeMessage = message;
      }
    }
  }

  return {
    scheduleMessage,
    noticeMessage
  };
}

// ==========================================
// SETUP CHANNEL
// ==========================================

async function setupPrayerChannel(
  channel
) {
  if (!channel?.guild) {
    throw new Error(
      "Channel tidak valid."
    );
  }

  await channel.permissionOverwrites.edit(
    HUMAN_ROLE_ID,
    {
      ViewChannel: true,
      SendMessages: false,
      AddReactions: false,
      CreatePublicThreads: false,
      CreatePrivateThreads: false
    }
  );

  await channel.permissionOverwrites.edit(
    STAFF_ROLE_ID,
    {
      ViewChannel: true,
      SendMessages: true
    }
  );

  await channel.permissionOverwrites.edit(
    FOUNDER_ROLE_ID,
    {
      ViewChannel: true,
      SendMessages: true
    }
  );
}

// ==========================================
// UPDATE SCHEDULE
// ==========================================

async function updateSchedule(
  channel,
  location
) {
  const data =
    await getPrayerTimes(location);

  const {
    scheduleMessage,
    noticeMessage
  } =
    await findPrayerMessages(
      channel
    );

  const scheduleEmbed =
    createScheduleEmbed(
      location,
      data.timings
    );

  if (scheduleMessage) {
    await scheduleMessage.edit({
      embeds: [scheduleEmbed]
    });
  } else {
    await channel.send({
      embeds: [scheduleEmbed]
    });
  }

  return {
    timings: data.timings,
    noticeMessage
  };
}

// ==========================================
// NOTIFICATION
// ==========================================

async function updatePrayerNotice(
  channel,
  location,
  timings
) {
  const now =
    getCurrentMinutes();

  let currentPrayer = null;

  for (const prayer of prayerOrder) {
    const prayerTime =
      timeToMinutes(
        timings[prayer]
      );

    if (now >= prayerTime) {
      currentPrayer = prayer;
    }
  }

  if (!currentPrayer) {
    return;
  }

  const currentTime =
    timeToMinutes(
      timings[currentPrayer]
    );

  const elapsed =
    now - currentTime;

  if (
    elapsed >=
    NOTICE_EXPIRE_HOURS * 60
  ) {
    return;
  }

  const {
    noticeMessage
  } =
    await findPrayerMessages(
      channel
    );

  const embed =
    createNoticeEmbed(
      location,
      currentPrayer,
      timings[currentPrayer]
    );

  if (noticeMessage) {
    await noticeMessage.edit({
      embeds: [embed]
    });
  } else {
    await channel.send({
      embeds: [embed]
    });
  }
}

// ==========================================
// START SYSTEM
// ==========================================

async function startPrayerSystem(client) {
  console.log(
    "🕌 Prayer system siap."
  );

  // Sistem akan aktif setelah /setup-prayer
}

// ==========================================
// COMMAND HANDLER
// ==========================================

async function handlePrayerCommand(
  interaction
) {
  if (
    !canManagePrayer(
      interaction.member
    )
  ) {
    return interaction.reply({
      content:
        "❌ Hanya Staff/Founder yang dapat mengatur jadwal sholat.",
      ephemeral: true
    });
  }

  const channel =
    interaction.options.getChannel(
      "channel"
    );

  const location =
    interaction.options.getString(
      "location"
    );

  if (!channel?.isTextBased()) {
    return interaction.reply({
      content:
        "❌ Channel harus berupa text channel.",
      ephemeral: true
    });
  }

  await interaction.deferReply({
    ephemeral: true
  });

  try {
    await setupPrayerChannel(
      channel
    );

    const result =
      await updateSchedule(
        channel,
        location
      );

    await updatePrayerNotice(
      channel,
      location,
      result.timings
    );

    return interaction.editReply(
      `✅ Prayer system berhasil dipasang.\n\n` +
      `**Channel:** ${channel}\n` +
      `**Lokasi:** ${location}`
    );

  } catch (error) {
    console.error(
      "Prayer setup error:",
      error
    );

    return interaction.editReply(
      "❌ Gagal memasang prayer system."
    );
  }
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  prayerCommand,
  handlePrayerCommand,
  startPrayerSystem
};