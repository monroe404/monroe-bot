const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");

const {
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID
} = require("../config");

// ========================================
// COMMAND
// ========================================

const prayerCommand = new SlashCommandBuilder()
  .setName("setup-prayer")
  .setDescription("Mengirim jadwal sholat Indonesia.")
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Channel untuk jadwal sholat.")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageGuild
  );

// ========================================
// ZONA INDONESIA
// ========================================

const zones = [
  {
    name: "WIB",
    emoji: "🌅",
    city: "Jakarta"
  },
  {
    name: "WITA",
    emoji: "☀️",
    city: "Makassar"
  },
  {
    name: "WIT",
    emoji: "🌄",
    city: "Jayapura"
  }
];

// ========================================
// NAMA SHOLAT
// ========================================

const prayerNames = {
  Fajr: "Shubuh",
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

// ========================================
// PERMISSION
// ========================================

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

// ========================================
// TANGGAL INDONESIA
// ========================================

function getToday() {
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

// ========================================
// GET DATE API
// ========================================

function getApiDate() {
  const now = new Date();

  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    ).formatToParts(now);

  const day =
    parts.find(
      x => x.type === "day"
    )?.value;

  const month =
    parts.find(
      x => x.type === "month"
    )?.value;

  const year =
    parts.find(
      x => x.type === "year"
    )?.value;

  return `${day}-${month}-${year}`;
}

// ========================================
// AMBIL JADWAL
// ========================================

async function getPrayerTimes(city) {
  const date =
    getApiDate();

  const url =
    `https://api.aladhan.com/v1/timingsByCity/` +
    `${date}` +
    `?city=${encodeURIComponent(city)}` +
    `&country=Indonesia` +
    `&method=20`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `API HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    data.code !== 200 ||
    !data.data?.timings
  ) {
    throw new Error(
      `Jadwal ${city} tidak ditemukan`
    );
  }

  return data.data.timings;
}

// ========================================
// CLEAN TIME
// ========================================

function cleanTime(time) {
  if (!time) {
    return "--:--";
  }

  return time
    .replace(/\s*\(.+\)/, "")
    .trim();
}

// ========================================
// BUAT BARIS SHOLAT
// ========================================

function createPrayerRows(timings) {
  return prayerOrder
    .map(prayer => {
      const time =
        cleanTime(
          timings[prayer]
        );

      return (
        `**${prayerNames[prayer]}**` +
        `  \`${time}\``
      );
    })
    .join("\n");
}

// ========================================
// BUAT CARD ZONA
// ========================================

async function createZoneContainer(zone) {
  let timings;

  try {
    timings =
      await getPrayerTimes(
        zone.city
      );
  } catch (error) {
    console.error(
      `❌ ${zone.name}:`,
      error.message
    );

    return new ContainerBuilder()
      .setAccentColor(0xF97316)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${zone.emoji} ${zone.name}\n` +
          `**${zone.city}**\n\n` +
          `❌ Jadwal tidak dapat diambil saat ini.`
        )
      );
  }

  const rows =
    createPrayerRows(
      timings
    );

  return new ContainerBuilder()
    .setAccentColor(0xF97316)

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${zone.emoji} ${zone.name}\n` +
        `**${zone.city}, Indonesia**`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        rows
      )
    );
}

// ========================================
// COMPONENTS V2
// ========================================

async function createPrayerComponents() {
  const components = [];

  // HEADER
  components.push(
    new ContainerBuilder()
      .setAccentColor(0xF97316)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# 🕌 JADWAL SHOLAT\n` +
          `**${getToday()}**\n` +
          `Jadwal sholat Indonesia`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "Waktu sholat berdasarkan wilayah waktu Indonesia."
        )
      )
  );

  // WIB
  components.push(
    await createZoneContainer(
      zones[0]
    )
  );

  // WITA
  components.push(
    await createZoneContainer(
      zones[1]
    )
  );

  // WIT
  components.push(
    await createZoneContainer(
      zones[2]
    )
  );

  // FOOTER
  components.push(
    new ContainerBuilder()
      .setAccentColor(0xF97316)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "### Keterangan\n" +
          "🇮🇩 WIB — Waktu Indonesia Barat\n" +
          "🇮🇩 WITA — Waktu Indonesia Tengah\n" +
          "🇮🇩 WIT — Waktu Indonesia Timur\n\n" +
          "Jadwal dapat berbeda beberapa menit " +
          "tergantung lokasi."
        )
      )
  );

  return components;
}

// ========================================
// CARI PESAN JADWAL
// ========================================

async function findPrayerMessage(channel) {
  const messages =
    await channel.messages.fetch({
      limit: 50
    });

  for (
    const message
    of messages.values()
  ) {
    if (
      !message.author.bot
    ) {
      continue;
    }

    if (
      message.flags.has(
        MessageFlags.IsComponentsV2
      )
    ) {
      return message;
    }
  }

  return null;
}

// ========================================
// KIRIM / UPDATE
// ========================================

async function sendPrayerSchedule(channel) {
  const components =
    await createPrayerComponents();

  const oldMessage =
    await findPrayerMessage(
      channel
    );

  if (oldMessage) {
    await oldMessage.edit({
      components,
      flags:
        MessageFlags.IsComponentsV2
    });

    return oldMessage;
  }

  return await channel.send({
    components,
    flags:
      MessageFlags.IsComponentsV2
  });
}

// ========================================
// SETUP CHANNEL
// ========================================

async function setupPrayerChannel(channel) {
  const everyone =
    channel.guild.roles.everyone;

  await channel.permissionOverwrites.edit(
    everyone,
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

// ========================================
// COMMAND HANDLER
// ========================================

async function handlePrayerCommand(interaction) {
  if (
    !canManagePrayer(
      interaction.member
    )
  ) {
    return interaction.reply({
      content:
        "❌ Hanya Staff/Founder yang dapat menggunakan command ini.",
      ephemeral: true
    });
  }

  const channel =
    interaction.options.getChannel(
      "channel"
    );

  if (
    !channel ||
    !channel.isTextBased()
  ) {
    return interaction.reply({
      content:
        "❌ Pilih text channel yang valid.",
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

    await sendPrayerSchedule(
      channel
    );

    return interaction.editReply(
      `✅ Jadwal sholat berhasil dikirim ke ${channel}.`
    );

  } catch (error) {
    console.error(
      "❌ Prayer Error:",
      error
    );

    return interaction.editReply(
      "❌ Gagal mengirim jadwal sholat."
    );
  }
}

// ========================================
// AUTO UPDATE
// ========================================

let prayerInterval = null;

function startPrayerSystem(client) {
  console.log(
    "🕌 Prayer system aktif."
  );

  if (prayerInterval) {
    clearInterval(
      prayerInterval
    );
  }

  prayerInterval =
    setInterval(
      async () => {
        try {
          const guild =
            client.guilds.cache.first();

          if (!guild) return;

          const channels =
            guild.channels.cache.filter(
              channel =>
                channel.isTextBased() &&
                channel.viewable
            );

          for (
            const channel
            of channels.values()
          ) {
            try {
              const message =
                await findPrayerMessage(
                  channel
                );

              if (!message) {
                continue;
              }

              await sendPrayerSchedule(
                channel
              );

            } catch {
              // Abaikan channel
            }
          }

        } catch (error) {
          console.error(
            "❌ Prayer update error:",
            error
          );
        }
      },
      60 * 60 * 1000
    );
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  prayerCommand,
  handlePrayerCommand,
  startPrayerSystem
};