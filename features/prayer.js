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
// SETTINGS
// ========================================

const API_METHOD = 20;

const prayerZones = [
  {
    name: "WIB",
    cities: [
      "Jakarta, Indonesia",
      "Bandung, Indonesia",
      "Surabaya, Indonesia",
      "Medan, Indonesia",
      "Palembang, Indonesia",
      "Semarang, Indonesia",
      "Yogyakarta, Indonesia",
      "Bandar Lampung, Indonesia",
      "Pontianak, Indonesia"
    ]
  },
  {
    name: "WITA",
    cities: [
      "Denpasar, Indonesia",
      "Makassar, Indonesia",
      "Banjarmasin, Indonesia",
      "Samarinda, Indonesia",
      "Balikpapan, Indonesia",
      "Mataram, Indonesia",
      "Manado, Indonesia"
    ]
  },
  {
    name: "WIT",
    cities: [
      "Jayapura, Indonesia",
      "Ambon, Indonesia",
      "Ternate, Indonesia",
      "Sorong, Indonesia"
    ]
  }
];

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

// ========================================
// SLASH COMMAND
// ========================================

const prayerCommand =
  new SlashCommandBuilder()
    .setName("setup-prayer")
    .setDescription(
      "Mengirim jadwal sholat seluruh Indonesia."
    )
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription(
          "Channel untuk jadwal sholat."
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    );

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
// DATE
// ========================================

function getIndonesiaDate() {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).format(new Date());
}

// ========================================
// API
// ========================================

async function getPrayerTimes(city) {
  const now = new Date();

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const year =
    now.getFullYear();

  const address =
    encodeURIComponent(city);

  const url =
    `https://api.aladhan.com/v1/timingsByAddress/` +
    `${day}-${month}-${year}` +
    `?address=${address}` +
    `&country=Indonesia` +
    `&method=${API_METHOD}`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Prayer API error: ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    data.code !== 200 ||
    !data.data?.timings
  ) {
    throw new Error(
      `Data sholat tidak ditemukan untuk ${city}`
    );
  }

  return data.data.timings;
}

// ========================================
// FORMAT TIME
// ========================================

function cleanTime(time) {
  if (!time) return "--:--";

  return time
    .replace(/\s*\(.+\)/, "")
    .trim();
}

// ========================================
// BUILD ZONE CONTENT
// ========================================

async function buildZone(zone) {
  const results = [];

  for (const city of zone.cities) {
    try {
      const timings =
        await getPrayerTimes(city);

      const cityName =
        city.replace(
          ", Indonesia",
          ""
        );

      const lines = prayerOrder.map(
        prayer => {
          return (
            `**${prayerNames[prayer]}** ` +
            `\`${cleanTime(
              timings[prayer]
            )}\``
          );
        }
      );

      results.push(
        `**${cityName}**\n` +
        lines.join("  •  ")
      );

    } catch (error) {
      console.error(
        `❌ Gagal mengambil ${city}:`,
        error.message
      );
    }
  }

  return results;
}

// ========================================
// COMPONENTS V2
// ========================================

async function createPrayerComponents() {
  const container =
    new ContainerBuilder();

  // HEADER
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "# 🕌 JADWAL SHOLAT\n" +
      `**${getIndonesiaDate()}**\n` +
      "Jadwal sholat berdasarkan wilayah Indonesia."
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  // ZONES
  for (const zone of prayerZones) {
    const cities =
      await buildZone(zone);

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🇮🇩 ${zone.name}`
      )
    );

    if (cities.length) {
      for (const city of cities) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            city
          )
        );

        container.addSeparatorComponents(
          new SeparatorBuilder()
        );
      }
    } else {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "Data jadwal belum tersedia."
        )
      );
    }
  }

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "### Catatan\n" +
      "Waktu dapat berbeda beberapa menit " +
      "antara daerah yang berbeda dalam satu zona waktu."
    )
  );

  return [container];
}

// ========================================
// FIND OLD MESSAGE
// ========================================

async function findPrayerMessage(channel) {
  const messages =
    await channel.messages.fetch({
      limit: 50
    });

  for (const message of messages.values()) {
    if (
      !message.author.bot
    ) {
      continue;
    }

    if (
      !message.components?.length
    ) {
      continue;
    }

    return message;
  }

  return null;
}

// ========================================
// SEND / UPDATE
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
// CHANNEL PERMISSIONS
// ========================================

async function setupPrayerChannel(channel) {
  if (!channel?.guild) {
    throw new Error(
      "Channel tidak valid."
    );
  }

  // Human / member biasa hanya bisa melihat
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

  // STAFF
  await channel.permissionOverwrites.edit(
    STAFF_ROLE_ID,
    {
      ViewChannel: true,
      SendMessages: true
    }
  );

  // FOUNDER
  await channel.permissionOverwrites.edit(
    FOUNDER_ROLE_ID,
    {
      ViewChannel: true,
      SendMessages: true
    }
  );
}

// ========================================
// SLASH COMMAND HANDLER
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
      `✅ Jadwal sholat berhasil dipasang di ${channel}.`
    );

  } catch (error) {
    console.error(
      "❌ Prayer setup error:",
      error
    );

    return interaction.editReply(
      "❌ Gagal memasang jadwal sholat."
    );
  }
}

// ========================================
// AUTO UPDATE
// ========================================

let prayerInterval = null;

async function startPrayerSystem(client) {
  console.log(
    "🕌 Prayer system aktif."
  );

  if (prayerInterval) {
    clearInterval(
      prayerInterval
    );
  }

  // Update setiap 1 jam
  prayerInterval = setInterval(
    async () => {
      try {
        const guild =
          client.guilds.cache.first();

        if (!guild) return;

        // Cari channel yang mempunyai
        // pesan Components V2 bot.
        const channels =
          guild.channels.cache.filter(
            channel =>
              channel.isTextBased() &&
              channel.viewable
          );

        for (const channel of channels.values()) {
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
            // Abaikan channel yang tidak dapat diakses
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