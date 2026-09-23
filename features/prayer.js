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
      .setDescription("Channel jadwal sholat.")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageGuild
  );

// ========================================
// KOTA PER ZONA
// ========================================

const zones = {
  WIB: [
    "Jakarta",
    "Bandung",
    "Surabaya",
    "Medan",
    "Palembang",
    "Semarang",
    "Yogyakarta",
    "Bandar Lampung",
    "Pontianak"
  ],

  WITA: [
    "Denpasar",
    "Makassar",
    "Banjarmasin",
    "Samarinda",
    "Balikpapan",
    "Mataram",
    "Manado",
    "Kupang"
  ],

  WIT: [
    "Jayapura",
    "Ambon",
    "Ternate",
    "Sorong",
    "Manokwari"
  ]
};

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
// TANGGAL
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
// AMBIL JADWAL
// ========================================

async function getPrayerTimes(city) {
  const now = new Date();

  const date = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  ).format(now);

  const [day, month, year] =
    date.split("/");

  const address =
    encodeURIComponent(
      `${city}, Indonesia`
    );

  const url =
    `https://api.aladhan.com/v1/timingsByAddress/` +
    `${day}-${month}-${year}` +
    `?address=${address}` +
    `&country=Indonesia` +
    `&method=20`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    data.code !== 200 ||
    !data.data?.timings
  ) {
    throw new Error(
      `Jadwal ${city} tidak tersedia`
    );
  }

  return data.data.timings;
}

// ========================================
// FORMAT KOTA
// ========================================

function createCityText(
  city,
  timings
) {
  let text =
    `### ${city}\n`;

  for (const prayer of prayerOrder) {
    const time =
      timings[prayer]
        ?.replace(/\s*\(.+\)/, "")
        .trim() || "--:--";

    text +=
      `**${prayerNames[prayer]}** — \`${time}\`\n`;
  }

  return text;
}

// ========================================
// BUILD ZONA
// ========================================

async function buildZone(
  zoneName,
  cities
) {
  const result = [];

  for (const city of cities) {
    try {
      const timings =
        await getPrayerTimes(city);

      result.push(
        createCityText(
          city,
          timings
        )
      );

    } catch (error) {
      console.error(
        `❌ ${zoneName} - ${city}:`,
        error.message
      );
    }
  }

  return result;
}

// ========================================
// COMPONENTS V2
// ========================================

async function createPrayerMessage() {
  const container =
    new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# 🕌 JADWAL SHOLAT\n` +
      `**${getToday()}**\n` +
      `Jadwal sholat wilayah Indonesia`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  // ==============================
  // WIB
  // ==============================

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "## 🇮🇩 WIB"
    )
  );

  const wib =
    await buildZone(
      "WIB",
      zones.WIB
    );

  for (const city of wib) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        city
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );
  }

  // ==============================
  // WITA
  // ==============================

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "## 🇮🇩 WITA"
    )
  );

  const wita =
    await buildZone(
      "WITA",
      zones.WITA
    );

  for (const city of wita) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        city
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );
  }

  // ==============================
  // WIT
  // ==============================

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "## 🇮🇩 WIT"
    )
  );

  const wit =
    await buildZone(
      "WIT",
      zones.WIT
    );

  for (const city of wit) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        city
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "Jadwal dapat mengalami perbedaan beberapa menit antarwilayah."
    )
  );

  return [container];
}

// ========================================
// CARI PESAN LAMA
// ========================================

async function findPrayerMessage(channel) {
  const messages =
    await channel.messages.fetch({
      limit: 50
    });

  for (const message of messages.values()) {
    if (
      message.author.bot &&
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
// SEND / UPDATE
// ========================================

async function sendPrayerSchedule(
  channel
) {
  const components =
    await createPrayerMessage();

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

async function setupPrayerChannel(
  channel
) {
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
      "❌ Gagal mengambil jadwal sholat."
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
    setInterval(async () => {
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

            if (!message) continue;

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
    }, 60 * 60 * 1000);
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  prayerCommand,
  handlePrayerCommand,
  startPrayerSystem
};