const fs = require("fs");
const path = require("path");

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

const {
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID,
  ORDER_CATEGORY_NAME
} = require("../config");

// =====================================
// DATA SLOT
// =====================================

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(
  DATA_DIR,
  "catalog-slots.json"
);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {
    recursive: true
  });
}

function loadSlots() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return {};
    }

    return JSON.parse(
      fs.readFileSync(
        DATA_FILE,
        "utf8"
      )
    );
  } catch {
    return {};
  }
}

function saveSlots(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(
      data,
      null,
      2
    )
  );
}

let slots = loadSlots();

function cleanExpiredSlots() {
  const now = Date.now();
  let changed = false;

  for (const key of Object.keys(slots)) {
    if (
      slots[key].expiresAt &&
      now >= slots[key].expiresAt
    ) {
      delete slots[key];
      changed = true;
    }
  }

  if (changed) {
    saveSlots(slots);
  }
}

function getSlot(key) {
  cleanExpiredSlots();

  return slots[key]?.amount ?? 0;
}

function setSlot(key, amount) {
  slots[key] = {
    amount,
    expiresAt:
      Date.now() +
      7 * 24 * 60 * 60 * 1000
  };

  saveSlots(slots);
}

// =====================================
// PRODUCT DATA
// =====================================

const products = {

  design: {
    name: "🎨 Jasa Design",

    description:
      "Jasa pembuatan poster custom sesuai konsep dan kebutuhan.",

    packages: {

      poster: {
        name: "Poster Design",
        price: "7.000 IDR",

        include: [
          "1 desain poster custom",
          "Menyesuaikan konsep/request",
          "Revisi sesuai kesepakatan"
        ]
      }

    }
  },

  build_community: {

    name:
      "🏢 Community Server",

    description:
      "Build server Discord Community sesuai kebutuhan.",

    packages: {

      packet1: {
        name: "Packet 1",
        price: "6.000 IDR",

        include: [
          "Channel Setup",
          "Server Settings",
          "Permission Management",
          "Role Management",
          "Tidak termasuk bot"
        ]
      },

      packet2: {
        name: "Packet 2",
        price: "12.000 IDR",

        include: [
          "Channel Setup",
          "Server Settings",
          "Permission Management",
          "Role Management",
          "Server Bot",
          "Moderator Bot",
          "Take Role",
          "Request bot lainnya"
        ]
      }

    }
  },

  build_roleplay: {

    name:
      "🚔 Roleplay Server",

    description:
      "Build server Discord untuk kebutuhan Roleplay.",

    packages: {

      packetA: {
        name: "Packet A",
        price: "15.000 IDR",

        include: [
          "Channel Management",
          "Role Management",
          "Tidak termasuk bot"
        ]
      },

      packetB: {
        name: "Packet B",
        price: "20.000 IDR",

        include: [
          "Channel Management",
          "Role Management",
          "Bot Setup",
          "Tidak termasuk bot UCP / sistem server Roleplay"
        ]
      }

    }
  },

  modpack_android: {

    name:
      "📱 Android Modpack",

    description:
      "Jasa racik modpack untuk Android.",

    packages: {

      low: {
        name: "Low",
        price: "5.000 IDR",

        include: [
          "Racik modpack Low"
        ]
      },

      medium: {
        name: "Medium",
        price: "7.000 IDR",

        include: [
          "Racik modpack Medium"
        ]
      }

    }
  },

  modpack_desktop: {

    name:
      "🖥️ Desktop Modpack",

    description:
      "Jasa racik modpack untuk Desktop.",

    packages: {

      low: {
        name: "Low",
        price: "7.000 IDR",

        include: [
          "Racik modpack Low"
        ]
      },

      medium: {
        name: "Medium",
        price: "10.000 IDR",

        include: [
          "Racik modpack Medium"
        ]
      }

    }
  },

  rekber: {

    name: "🤝 Rekber",

    description:
      "Layanan rekening bersama untuk membantu proses transaksi.",

    packages: {

      fee: {
        name: "Fee Rekber",
        price:
          "Sesuai nominal transaksi",

        include: [
          "1.000 – 5.000 IDR → Fee 1.000 IDR",
          "6.000 – 15.000 IDR → Fee 2.000 IDR",
          "16.000 – 35.000 IDR → Fee 3.000 IDR",
          "36.000 – 50.000 IDR → Fee 4.000 IDR",
          "51.000+ IDR → Fee 5.000 IDR"
        ]
      }

    }
  },

  setup_bot: {

    name:
      "🤖 Set Up Bot",

    description:
      "Setup dan konfigurasi bot Discord sesuai kebutuhan server.",

    packages: {

      consultation: {
        name:
          "Custom Bot Setup",

        price:
          "Konsultasi",

        include: [
          "Custom setup sesuai kebutuhan",
          "Konsultasi fitur bot",
          "Open ticket untuk pembahasan"
        ]
      }

    }
  }

};
// =====================================
// COMMAND
// =====================================

const catalogCommand =
  new SlashCommandBuilder()
    .setName("setup-catalog")
    .setDescription("Mengirim Catalog Monroe.")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Channel Catalog.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    );

const setSlotCommand =
  new SlashCommandBuilder()
    .setName("setslot")
    .setDescription(
      "Mengatur slot Catalog selama 7 hari."
    )
    .addStringOption(option =>
      option
        .setName("target")
        .setDescription(
          "Produk / paket yang ingin diberi slot."
        )
        .setRequired(true)
        .addChoices(
          {
            name: "Design - Poster",
            value: "design_poster"
          },
          {
            name:
              "Discord Community - Packet 1",
            value: "build_community_packet1"
          },
          {
            name:
              "Discord Community - Packet 2",
            value: "build_community_packet2"
          },
          {
            name:
              "Discord Roleplay - Packet A",
            value: "build_roleplay_packetA"
          },
          {
            name:
              "Discord Roleplay - Packet B",
            value: "build_roleplay_packetB"
          },
          {
            name:
              "Modpack Android - Low",
            value: "android_low"
          },
          {
            name:
              "Modpack Android - Medium",
            value: "modpack_android_medium"
          },
          {
            name:
              "Modpack Desktop - Low",
            value: "modpack_desktop_low"
          },
          {
            name:
              "Modpack Desktop - Medium",
            value: "modpack_desktop_medium"
          }
        )
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Jumlah slot.")
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    );

// =====================================
// PERMISSION
// =====================================

function canManageCatalog(member) {
  if (!member) return false;

  return (
    member.roles.cache.has(
      STAFF_ROLE_ID
    ) ||
    member.roles.cache.has(
      FOUNDER_ROLE_ID
    ) ||
    member.permissions.has(
      PermissionFlagsBits.Administrator
    )
  );
}

// =====================================
// MAIN CATALOG
// =====================================

function createMainCatalog() {
  return [

    new ContainerBuilder()
      .setAccentColor(0xF97316)

      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(
            "# 🛍️ MONROE CATALOG\n" +
            "Pilih jasa yang ingin kamu lihat."
          )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(
            "Pilih salah satu kategori di bawah."
          )
      ),

    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_design"
          )
          .setLabel(
            "Jasa Design"
          )
          .setEmoji("🎨")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_build"
          )
          .setLabel(
            "Build Discord"
          )
          .setEmoji("💻")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_modpack"
          )
          .setLabel(
            "Racik Modpack"
          )
          .setEmoji("🧰")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_rekber"
          )
          .setLabel(
            "Rekber"
          )
          .setEmoji("🤝")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_bot"
          )
          .setLabel(
            "Set Up Bot"
          )
          .setEmoji("🤖")
          .setStyle(
            ButtonStyle.Secondary
          )
      )
  ];
}

// =====================================
// PRODUCT VIEW
// =====================================

function createProductView(
  productKey
) {

  const product =
    products[productKey];

  const components = [

    new ContainerBuilder()
      .setAccentColor(0xF97316)

      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(
            `# ${product.name}\n` +
            `${product.description}`
          )
      )
  ];

  const packetKeys =
    Object.keys(
      product.packages
    );

  for (
    const packetKey
    of packetKeys
  ) {

    const packet =
      product.packages[
        packetKey
      ];

    const slotKey =
      `${productKey}_${packetKey}`;

    const slot =
      getSlot(slotKey);

    components.push(

      new ContainerBuilder()
        .setAccentColor(0xF97316)

        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(

              `## ${packet.name}\n` +

              `💰 **${packet.price}**\n\n` +

              `**Include:**\n` +

              packet.include
                .map(
                  item =>
                    `• ${item}`
                )
                .join("\n") +

              `\n\n` +

              `🎟️ **Slot: ${slot}**`
            )
        )

        .addActionRowComponents(

          new ActionRowBuilder()
            .addComponents(

              new ButtonBuilder()
                .setCustomId(
                  `catalog_order_${productKey}_${packetKey}`
                )
                .setLabel(
                  slot > 0
                    ? "AMBIL PAKET"
                    : "SLOT PENUH"
                )
                .setEmoji(
                  slot > 0
                    ? "🛒"
                    : "🔒"
                )
                .setStyle(
                  slot > 0
                    ? ButtonStyle.Success
                    : ButtonStyle.Secondary
                )
                .setDisabled(
                  slot <= 0
                )
            )
        )
    );
  }

  components.push(

    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_back"
          )
          .setLabel(
            "Kembali"
          )
          .setStyle(
            ButtonStyle.Secondary
          )
      )
  );

  return components;
}

// =====================================
// SETUP CATALOG
// =====================================

async function handleCatalogCommand(
  interaction
) {

  if (
    !canManageCatalog(
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
    channel.type !==
      ChannelType.GuildText
  ) {

    return interaction.reply({
      content:
        "❌ Pilih text channel yang valid.",
      ephemeral: true
    });
  }

  await channel.send({
    components:
      createMainCatalog(),

    flags:
      MessageFlags.IsComponentsV2
  });

  return interaction.reply({
    content:
      `✅ Catalog Beta berhasil dikirim ke ${channel}.`,
    ephemeral: true
  });
}

// =====================================
// SET SLOT
// =====================================

async function handleSetSlot(
  interaction
) {

  if (
    !canManageCatalog(
      interaction.member
    )
  ) {

    return interaction.reply({
      content:
        "❌ Hanya Staff/Founder yang dapat mengatur slot.",
      ephemeral: true
    });
  }

  const target =
    interaction.options.getString(
      "target"
    );

  const amount =
    interaction.options.getInteger(
      "amount"
    );

  setSlot(
    target,
    amount
  );

  return interaction.reply({
    content:
      `✅ Slot **${target}** berhasil diatur menjadi **${amount}**.\n` +
      `⏳ Slot ini berlaku selama **7 hari**.`,

    ephemeral: true
  });
}

// =====================================
// ORDER TICKET
// =====================================

async function createOrderTicket(
  interaction,
  productKey,
  packetKey
) {

  cleanExpiredSlots();

  const slotKey =
    `${productKey}_${packetKey}`;

  const currentSlot =
    getSlot(slotKey);

  if (
    currentSlot <= 0
  ) {

    return interaction.reply({
      content:
        "❌ Slot untuk paket ini sudah habis.",
      ephemeral: true
    });
  }

  const product =
    products[
      productKey
    ];

  const packet =
    product?.packages?.[
      packetKey
    ];

  if (
    !product ||
    !packet
  ) {

    return interaction.reply({
      content:
        "❌ Produk tidak ditemukan.",
      ephemeral: true
    });
  }

  const guild =
    interaction.guild;

  const existing =
    guild.channels.cache.find(
      channel =>
        channel.topic ===
        `catalog-owner:${interaction.user.id}`
    );

  if (existing) {

    return interaction.reply({
      content:
        `❌ Kamu masih memiliki order aktif: ${existing}.`,
      ephemeral: true
    });
  }

  const category =
    guild.channels.cache.find(
      channel =>
        channel.type ===
          ChannelType.GuildCategory &&
        channel.name ===
          ORDER_CATEGORY_NAME
    );

  const overwrites = [

    {
      id:
        guild.roles.everyone.id,

      deny: [
        "ViewChannel"
      ]
    },

    {
      id:
        interaction.user.id,

      allow: [
        "ViewChannel",
        "SendMessages",
        "ReadMessageHistory"
      ]
    },

    {
      id:
        STAFF_ROLE_ID,

      allow: [
        "ViewChannel",
        "SendMessages",
        "ReadMessageHistory"
      ]
    },

    {
      id:
        FOUNDER_ROLE_ID,

      allow: [
        "ViewChannel",
        "SendMessages",
        "ReadMessageHistory"
      ]
    },

    {
      id:
        guild.members.me.id,

      allow: [
        "ViewChannel",
        "SendMessages",
        "ReadMessageHistory",
        "ManageChannels"
      ]
    }
  ];

  const ticket =
    await guild.channels.create({

      name:
        `order-${interaction.user.username}`
          .toLowerCase()
          .replace(
            /[^a-z0-9-]/g,
            ""
          )
          .slice(0, 90),

      type:
        ChannelType.GuildText,

      parent:
        category?.id ||
        null,

      topic:
        `catalog-owner:${interaction.user.id}`,

      permissionOverwrites:
        overwrites
    });

  setSlot(
    slotKey,
    currentSlot - 1
  );

  const embed =
    new EmbedBuilder()
      .setColor(0xF97316)

      .setTitle(
        "🛒 MONROE ORDER"
      )

      .addFields(

        {
          name:
            "👤 Buyer",

          value:
            `<@${interaction.user.id}>`
        },

        {
          name:
            "📦 Product",

          value:
            product.name
        },

        {
          name:
            "🎁 Package",

          value:
            packet.name
        },

        {
          name:
            "💰 Price",

          value:
            packet.price
        },

        {
          name:
            "🎟️ Remaining Slot",

          value:
            `${currentSlot - 1}`
        },

        {
          name:
            "📋 Include",

          value:
            packet.include
              .map(
                item =>
                  `• ${item}`
              )
              .join("\n")
        }

      )

      .setFooter({
        text:
          "MONROE COMMUNITY © 2026"
      });

  await ticket.send({

    content:
      `🛡️ **STAFF**\n` +
      `<@&${STAFF_ROLE_ID}>\n\n` +
      `🛒 Order dari <@${interaction.user.id}>`,

    embeds: [
      embed
    ]
  });

  return interaction.reply({

    content:
      `✅ Order berhasil dibuat: ${ticket}\n` +
      `🎟️ Slot tersisa: **${currentSlot - 1}**`,

    ephemeral: true
  });
}

// =====================================
// BUTTON HANDLER
// =====================================

async function handleCatalogInteraction(
  interaction
) {

  if (
    !interaction.isButton()
  ) {
    return false;
  }

  const id =
    interaction.customId;

  if (
    !id.startsWith(
      "catalog_"
    )
  ) {
    return false;
  }

  if (
    id ===
    "catalog_back"
  ) {

    await interaction.update({

      components:
        createMainCatalog(),

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_design"
  ) {

    await interaction.update({

      components:
        createProductView(
          "design"
        ),

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_build"
  ) {

    await interaction.update({

      components: [

        new ContainerBuilder()
          .setAccentColor(
            0xF97316
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(
                "# 💻 BUILD DISCORD\n" +
                "Pilih jenis server."
              )
          ),

        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId(
                "catalog_build_community"
              )
              .setLabel(
                "Community Server"
              )
              .setEmoji("🏢")
              .setStyle(
                ButtonStyle.Primary
              ),

            new ButtonBuilder()
              .setCustomId(
                "catalog_build_roleplay"
              )
              .setLabel(
                "Roleplay Server"
              )
              .setEmoji("🚔")
              .setStyle(
                ButtonStyle.Primary
              ),

            new ButtonBuilder()
              .setCustomId(
                "catalog_back"
              )
              .setLabel(
                "Kembali"
              )
              .setStyle(
                ButtonStyle.Secondary
              )
          )
      ],

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_build_community"
  ) {

    await interaction.update({

      components:
        createProductView(
          "build_community"
        ),

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_build_roleplay"
  ) {

    await interaction.update({

      components:
        createProductView(
          "build_roleplay"
        ),

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_modpack"
  ) {

    await interaction.update({

      components: [

        new ContainerBuilder()
          .setAccentColor(
            0xF97316
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(
                "# 🧰 RACIK MODPACK\n" +
                "Pilih platform."
              )
          ),

        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId(
                "catalog_modpack_android"
              )
              .setLabel(
                "Android"
              )
              .setEmoji("📱")
              .setStyle(
                ButtonStyle.Primary
              ),

            new ButtonBuilder()
              .setCustomId(
                "catalog_modpack_desktop"
              )
              .setLabel(
                "Desktop"
              )
              .setEmoji("🖥️")
              .setStyle(
                ButtonStyle.Primary
              ),

            new ButtonBuilder()
              .setCustomId(
                "catalog_back"
              )
              .setLabel(
                "Kembali"
              )
              .setStyle(
                ButtonStyle.Secondary
              )
          )
      ],

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_modpack_android"
  ) {

    await interaction.update({

      components:
        createProductView(
          "modpack_android"
        ),

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_modpack_desktop"
  ) {

    await interaction.update({

      components:
        createProductView(
          "modpack_desktop"
        ),

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_rekber"
  ) {

    await interaction.update({

      components:
        createProductView(
          "rekber"
        ),

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_bot"
  ) {

    await interaction.update({

      components: [

        new ContainerBuilder()
          .setAccentColor(
            0xF97316
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(

                "# 🤖 SET UP BOT\n\n" +

                "Butuh bot Discord " +
                "sesuai kebutuhan server?\n\n" +

                "**Custom Bot Setup**\n" +

                "Fitur dan kebutuhan dapat " +
                "disesuaikan dengan server kamu.\n\n" +

                "💬 Untuk konsultasi mengenai " +
                "kebutuhan bot, silakan langsung open ticket."
              )
          ),

        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId(
                "catalog_bot_ticket"
              )
              .setLabel(
                "OPEN TICKET"
              )
              .setEmoji("🎟️")
              .setStyle(
                ButtonStyle.Success
              ),

            new ButtonBuilder()
              .setCustomId(
                "catalog_back"
              )
              .setLabel(
                "Kembali"
              )
              .setStyle(
                ButtonStyle.Secondary
              )
          )
      ],

      flags:
        MessageFlags.IsComponentsV2
    });

    return true;
  }

  if (
    id ===
    "catalog_bot_ticket"
  ) {

    return await createOrderTicket(
      interaction,
      "setup_bot",
      "consultation"
    );
  }

  if (
  id.startsWith(
    "catalog_order_"
  )
) {

  const orderData =
    id.replace(
      "catalog_order_",
      ""
    );

  const separator =
    orderData.lastIndexOf("_");

  const productKey =
    orderData.substring(
      0,
      separator
    );

  const packetKey =
    orderData.substring(
      separator + 1
    );

  return await createOrderTicket(
    interaction,
    productKey,
    packetKey
  );
  }

  return true;
}

// =====================================
// EXPORT
// =====================================

module.exports = {

  catalogCommand,

  setSlotCommand,

  handleCatalogCommand,

  handleCatalogInteraction,

  handleSetSlot

};