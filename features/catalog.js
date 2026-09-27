const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const {
  GUILD_ID,
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID
} = require("../config");

// ===============================
// EMOJI
// ===============================

const EMOJI = {
  discord: "<:discord:1524631979323162634>",
  money: "<a:MoneyWing:1505699929094492251>",
  thunder: "<a:bluethunder:1486764903594332311>"
};

// ===============================
// CATALOG CHANNELS
// ===============================

const CATALOG_CHANNELS = {
  build_discord: "1546029241441849474",
  setup_bot: "1553594084449452052",
  build_modpack: "1553594165541994497",
  design: "1553594223993823323",
  rekber: "1553594287541977191"
};

// ===============================
// PRODUCTS
// ===============================

const PRODUCTS = {

  // =============================
  // BUILD DISCORD
  // =============================

  community_1: {
    id: "community_1",
    category: "build_discord",
    name: "COMMUNITY PACKET 1",
    title: "BUILD DISCORD — COMMUNITY",
    price: 8000,
    slot: 4,

    include: [
      "Server Settings",
      "Server Permission",
      "Role Management",
      "Category & Channel Setup",
      "2× Revisi sebelum pesanan mencapai 24 jam",
      "Tidak termasuk konfigurasi bot"
    ],

    benefit: [
      "Struktur server lebih terorganisir",
      "Pengaturan permission yang lebih terkontrol",
      "Sistem role yang tertata sesuai kebutuhan",
      "Category dan channel disusun secara sistematis",
      "Memberikan tampilan server yang lebih profesional"
    ]
  },

  community_2: {
    id: "community_2",
    category: "build_discord",
    name: "COMMUNITY PACKET 2",
    title: "BUILD DISCORD — COMMUNITY",
    price: 12000,
    slot: 4,

    include: [
      "Channel Setup",
      "Server Settings",
      "Permission Management",
      "Role Management",
      "Server Bot",
      "Moderator Bot",
      "Take Role",
      "Request Bot sesuai kebutuhan"
    ],

    benefit: [
      "Struktur server lebih lengkap dan terorganisir",
      "Pengaturan role dan permission lebih terkontrol",
      "Dilengkapi konfigurasi bot dasar",
      "Sistem server disesuaikan dengan kebutuhan",
      "Membantu server siap digunakan dengan lebih cepat"
    ]
  },

  roleplay_a: {
    id: "roleplay_a",
    category: "build_discord",
    name: "ROLEPLAY PACKET A",
    title: "BUILD DISCORD — ROLEPLAY",
    price: 15000,
    slot: 4,

    include: [
      "Channel Management",
      "Role Management",
      "Category Setup",
      "Permission Management",
      "2× Revisi"
    ],

    benefit: [
      "Struktur server roleplay lebih terorganisir",
      "Pembagian role lebih tertata",
      "Category dan channel disusun sesuai kebutuhan",
      "Permission dapat disesuaikan dengan struktur server",
      "Server lebih siap digunakan untuk komunitas roleplay"
    ]
  },

  roleplay_b: {
    id: "roleplay_b",
    category: "build_discord",
    name: "ROLEPLAY PACKET B",
    title: "BUILD DISCORD — ROLEPLAY",
    price: 20000,
    slot: 4,

    include: [
      "Channel Management",
      "Role Management",
      "Category Setup",
      "Permission Management",
      "Basic Bot Configuration",
      "2× Revisi",
      "Tidak termasuk UCP / Server System Bot"
    ],

    benefit: [
      "Struktur server roleplay lebih lengkap",
      "Pengaturan role dan permission lebih terkontrol",
      "Konfigurasi bot dasar telah disiapkan",
      "Server disusun sesuai kebutuhan roleplay",
      "Memberikan struktur server yang lebih profesional"
    ]
  },

  discord_faction: {
    id: "discord_faction",
    category: "build_discord",
    name: "DISCORD FACTION",
    title: "BUILD DISCORD — FACTION",
    price: 10000,
    slot: 4,

    include: [
      "Category & Channel Setup",
      "Role Management",
      "Permission Management",
      "Faction Structure",
      "2× Revisi"
    ],

    benefit: [
      "Struktur faction lebih terorganisir",
      "Role faction disusun sesuai kebutuhan",
      "Permission lebih terkontrol",
      "Channel faction dibuat lebih sistematis",
      "Tampilan faction lebih profesional"
    ]
  },

  discord_store: {
    id: "discord_store",
    category: "build_discord",
    name: "DISCORD STORE",
    title: "BUILD DISCORD — STORE",
    price: 12000,
    slot: 4,

    include: [
      "Category & Channel Setup",
      "Role Management",
      "Permission Management",
      "Store Structure",
      "Basic Store Configuration",
      "2× Revisi"
    ],

    benefit: [
      "Struktur server store lebih terorganisir",
      "Channel produk dan transaksi lebih tertata",
      "Permission dapat disesuaikan",
      "Struktur toko dibuat lebih mudah digunakan",
      "Memberikan tampilan store yang lebih profesional"
    ]
  },

  // =============================
  // SET UP BOT
  // =============================

  add_features: {
    id: "add_features",
    category: "setup_bot",
    name: "ADD FEATURES",
    title: "SET UP BOT — ADD FEATURES",
    price: 5000,
    priceText: "5.000 IDR / feature",
    slot: 4
  },

  delete_features: {
    id: "delete_features",
    category: "setup_bot",
    name: "DELETE FEATURES",
    title: "SET UP BOT — DELETE FEATURES",
    price: 4000,
    priceText: "4.000 IDR / feature",
    slot: 4
  },

  setup_bot_discord: {
    id: "setup_bot_discord",
    category: "setup_bot",
    name: "SET UP BOT DISCORD",
    title: "SET UP BOT — DISCORD",
    price: 15000,
    priceText: "15.000 IDR / 4 feature",
    slot: 4,

    include: [
      "Set Up Bot Discord",
      "Konfigurasi hingga 4 Feature",
      "Pengaturan Command",
      "Pengaturan Permission",
      "Basic Testing"
    ],

    benefit: [
      "Bot siap digunakan sesuai kebutuhan",
      "Konfigurasi fitur lebih terstruktur",
      "Command dan permission disesuaikan dengan kebutuhan server",
      "Membantu mengurangi proses konfigurasi secara manual"
    ]
  },

  create_bot_js: {
    id: "create_bot_js",
    category: "setup_bot",
    name: "CREATE BOT JS",
    title: "SET UP BOT — CREATE BOT JS",
    price: 20000,
    priceText: "20.000 IDR",
    slot: 4,

    include: [
      "Pembuatan Bot Discord Berbasis JavaScript",
      "Request fitur sesuai kebutuhan",
      "Konfigurasi dasar bot",
      "Struktur kode yang terorganisir",
      "Basic Testing"
    ],

    benefit: [
      "Bot dibuat sesuai kebutuhan dan request",
      "Fitur dapat disesuaikan dengan konsep server",
      "Mendapatkan bot yang siap dikembangkan lebih lanjut",
      "Request bebas dengan batasan sesuai kesepakatan"
    ]
  },

  // =============================
  // BUILD MODPACK
  // =============================

  android_low: {
    id: "android_low",
    category: "build_modpack",
    name: "ANDROID LOW",
    title: "BUILD MODPACK — ANDROID LOW",
    price: 5000,
    slot: 4,

    include: [
      "Modpack untuk Android Low",
      "Optimasi mod sesuai perangkat",
      "Basic Testing"
    ],

    benefit: [
      "Modpack disesuaikan untuk perangkat dengan spesifikasi rendah",
      "Membantu menjaga performa game",
      "Modpack lebih ringan digunakan"
    ]
  },

  android_medium: {
    id: "android_medium",
    category: "build_modpack",
    name: "ANDROID MEDIUM",
    title: "BUILD MODPACK — ANDROID MEDIUM",
    price: 7000,
    slot: 4,

    include: [
      "Modpack untuk Android Medium",
      "Optimasi mod sesuai perangkat",
      "Basic Testing"
    ],

    benefit: [
      "Modpack disesuaikan dengan perangkat Android Medium",
      "Kualitas mod dapat dibuat lebih optimal",
      "Performa dan visual disesuaikan dengan perangkat"
    ]
  },

  desktop_low: {
    id: "desktop_low",
    category: "build_modpack",
    name: "DESKTOP LOW",
    title: "BUILD MODPACK — DESKTOP LOW",
    price: 7000,
    slot: 4,

    include: [
      "Modpack untuk Desktop Low",
      "Optimasi mod sesuai perangkat",
      "Basic Testing"
    ],

    benefit: [
      "Modpack disesuaikan untuk perangkat dengan spesifikasi rendah",
      "Membantu menjaga performa game",
      "Penggunaan mod dibuat lebih ringan"
    ]
  },

  desktop_medium: {
    id: "desktop_medium",
    category: "build_modpack",
    name: "DESKTOP MEDIUM",
    title: "BUILD MODPACK — DESKTOP MEDIUM",
    price: 10000,
    slot: 4,

    include: [
      "Modpack untuk Desktop Medium",
      "Optimasi mod sesuai perangkat",
      "Basic Testing"
    ],

    benefit: [
      "Modpack disesuaikan dengan perangkat Desktop Medium",
      "Kualitas visual dapat dibuat lebih optimal",
      "Performa disesuaikan dengan kemampuan perangkat"
    ]
  },

  // =============================
  // DESIGN
  // =============================

  poster: {
    id: "poster",
    category: "design",
    name: "POSTER",
    title: "DESIGN — POSTER",
    price: 7000,
    priceText: "7.000 IDR / poster",
    slot: 4,

    include: [
      "1× Custom Poster",
      "Konsep sesuai request",
      "Revisi sesuai kesepakatan"
    ],

    benefit: [
      "Desain dibuat sesuai kebutuhan",
      "Konsep dapat disesuaikan dengan request",
      "Cocok untuk kebutuhan announcement, promotion, atau branding"
    ]
  }

};

// ===============================
// CATEGORY
// ===============================

const CATEGORIES = {
  build_discord: {
    name: "BUILD DISCORD",
    channelId: CATALOG_CHANNELS.build_discord
  },

  setup_bot: {
    name: "SET UP BOT",
    channelId: CATALOG_CHANNELS.setup_bot
  },

  build_modpack: {
    name: "BUILD MODPACK",
    channelId: CATALOG_CHANNELS.build_modpack
  },

  design: {
    name: "DESIGN",
    channelId: CATALOG_CHANNELS.design
  },

  rekber: {
    name: "REKBER",
    channelId: CATALOG_CHANNELS.rekber
  }
};

// ===============================
// SLOT STORAGE
// ===============================

const slotData = {};

function getCurrentWeekKey() {
  const now = new Date();

  const firstDay = new Date(
    now.getFullYear(),
    0,
    1
  );

  const days =
    Math.floor(
      (now - firstDay) /
      86400000
    );

  const week =
    Math.ceil(
      (days + firstDay.getDay() + 1) / 7
    );

  return `${now.getFullYear()}-${week}`;
}

function getSlot(productId) {
  const weekKey = getCurrentWeekKey();

  if (!slotData[productId]) {
    slotData[productId] = {
      week: weekKey,
      extra: 0,
      used: 0
    };
  }

  if (slotData[productId].week !== weekKey) {
    slotData[productId].week = weekKey;
    slotData[productId].used = 0;
  }

  const product =
    PRODUCTS[productId];

  if (!product) {
    return 0;
  }

  return Math.max(
    0,
    product.slot +
      slotData[productId].extra -
      slotData[productId].used
  );
}

function useSlot(productId) {
  const weekKey = getCurrentWeekKey();

  if (!slotData[productId]) {
    slotData[productId] = {
      week: weekKey,
      extra: 0,
      used: 0
    };
  }

  if (slotData[productId].week !== weekKey) {
    slotData[productId].week = weekKey;
    slotData[productId].used = 0;
  }

  const available =
    getSlot(productId);

  if (available <= 0) {
    return false;
  }

  slotData[productId].used++;

  return true;
}

// ===============================
// STAFF CHECK
// ===============================

function isStaff(member) {
  if (!member) {
    return false;
  }

  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID)
  );
}

// ===============================
// FORMAT PRICE
// ===============================

function formatPrice(product) {
  if (product.priceText) {
    return product.priceText;
  }

  return `${product.price.toLocaleString("id-ID")} IDR`;
}

// ===============================
// PRODUCT EMBED
// ===============================

function buildProductEmbed(product) {
  const embed =
    new EmbedBuilder()
      .setColor(0xFF7A00)
      .setTitle(
        `${EMOJI.discord}  ${product.title}`
      )
      .setDescription(
        `\n` +
        `${EMOJI.money}  **Harga**\n` +
        `${formatPrice(product)}\n\n` +

        `${EMOJI.thunder}  **Slot**\n` +
        `${getSlot(product.id)} slot tersedia`
      );

  if (
    product.include &&
    product.include.length
  ) {
    embed.addFields({
      name: `${EMOJI.thunder}  Include`,
      value:
        product.include
          .map(item => item)
          .join("\n")
    });
  }

  if (
    product.benefit &&
    product.benefit.length
  ) {
    embed.addFields({
      name: `${EMOJI.thunder}  Benefit`,
      value:
        product.benefit
          .map(item => item)
          .join("\n")
    });
  }

  embed.setFooter({
    text: "MONROE COMMUNITY © 2026"
  });

  return embed;
}

// ===============================
// PRODUCT BUTTON
// ===============================

function buildProductButton(product) {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(
          `catalog_order_${product.id}`
        )
        .setLabel("ORDER")
        .setEmoji("🛒")
        .setStyle(ButtonStyle.Primary)
    );
}

// ===============================
// SEND PRODUCT
// ===============================

async function sendProduct(
  channel,
  product
) {
  if (!channel || !product) {
    return null;
  }

  return await channel.send({
    embeds: [
      buildProductEmbed(product)
    ],
    components: [
      buildProductButton(product)
    ]
  });
}

// ===============================
// SEND ALL PRODUCTS
// ===============================

async function sendAllProducts(
  channel,
  category
) {
  const products =
    Object.values(PRODUCTS)
      .filter(
        product =>
          product.category === category
      );

  const sent = [];

  for (const product of products) {
    const message =
      await sendProduct(
        channel,
        product
      );

    if (message) {
      sent.push(message);
    }
  }

  return sent;
}

// ===============================
// SETUP CATALOG COMMAND
// ===============================

const catalogCommand =
  new SlashCommandBuilder()
    .setName("setup-catalog")
    .setDescription(
      "Setup catalog Monroe Community"
    )
    .addStringOption(option =>
      option
        .setName("category")
        .setDescription(
          "Pilih kategori catalog"
        )
        .setRequired(true)
        .addChoices(
          {
            name: "Build Discord",
            value: "build_discord"
          },
          {
            name: "Set Up Bot",
            value: "setup_bot"
          },
          {
            name: "Build Modpack",
            value: "build_modpack"
          },
          {
            name: "Design",
            value: "design"
          },
          {
            name: "Rekber",
            value: "rekber"
          }
        )
    );

// ===============================
// SET SLOT COMMAND
// ===============================

const setSlotCommand =
  new SlashCommandBuilder()
    .setName("setslot")
    .setDescription(
      "Mengatur jumlah slot produk"
    )
    .addStringOption(option =>
      option
        .setName("product")
        .setDescription(
          "ID produk"
        )
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(option =>
      option
        .setName("slot")
        .setDescription(
          "Jumlah slot tambahan"
        )
        .setRequired(true)
        .setMinValue(0)
    );

// ===============================
// ADD SLOT COMMAND
// ===============================

const addSlotCommand =
  new SlashCommandBuilder()
    .setName("addslot")
    .setDescription(
      "Menambah slot produk"
    )
    .addStringOption(option =>
      option
        .setName("product")
        .setDescription(
          "ID produk"
        )
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription(
          "Jumlah slot tambahan"
        )
        .setRequired(true)
        .setMinValue(1)
    );

// ===============================
// HANDLE SETUP CATALOG
// ===============================

async function handleCatalogCommand(
  interaction
) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content:
        "❌ Kamu tidak memiliki permission.",
      ephemeral: true
    });
  }

  const category =
    interaction.options.getString(
      "category"
    );

  const categoryData =
    CATEGORIES[category];

  if (!categoryData) {
    return interaction.reply({
      content:
        "❌ Category tidak ditemukan.",
      ephemeral: true
    });
  }

  const channel =
    interaction.guild.channels.cache.get(
      categoryData.channelId
    );

  if (!channel) {
    return interaction.reply({
      content:
        "❌ Channel catalog tidak ditemukan.",
      ephemeral: true
    });
  }

  await interaction.deferReply({
    ephemeral: true
  });

  await sendAllProducts(
    channel,
    category
  );

  return interaction.editReply({
    content:
      `✅ Catalog **${categoryData.name}** berhasil dikirim ke <#${channel.id}>.`
  });
}

// ===============================
// HANDLE SET SLOT
// ===============================

async function handleSetSlot(
  interaction
) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content:
        "❌ Kamu tidak memiliki permission.",
      ephemeral: true
    });
  }

  const productId =
    interaction.options.getString(
      "product"
    );

  const amount =
    interaction.options.getInteger(
      "slot"
    );

  const product =
    PRODUCTS[productId];

  if (!product) {
    return interaction.reply({
      content:
        "❌ Produk tidak ditemukan.",
      ephemeral: true
    });
  }

  const weekKey =
    getCurrentWeekKey();

  if (!slotData[productId]) {
    slotData[productId] = {
      week: weekKey,
      extra: 0,
      used: 0
    };
  }

  slotData[productId].week =
    weekKey;

  slotData[productId].used = 0;

  slotData[productId].extra =
    amount - product.slot;

  if (
    slotData[productId].extra < 0
  ) {
    slotData[productId].extra = 0;
  }

  return interaction.reply({
    content:
      `✅ Slot **${product.name}** sekarang menjadi **${getSlot(productId)} slot**.`,
    ephemeral: true
  });
}

// ===============================
// HANDLE ADD SLOT
// ===============================

async function handleAddSlot(
  interaction
) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content:
        "❌ Kamu tidak memiliki permission.",
      ephemeral: true
    });
  }

  const productId =
    interaction.options.getString(
      "product"
    );

  const amount =
    interaction.options.getInteger(
      "amount"
    );

  const product =
    PRODUCTS[productId];

  if (!product) {
    return interaction.reply({
      content:
        "❌ Produk tidak ditemukan.",
      ephemeral: true
    });
  }

  const weekKey =
    getCurrentWeekKey();

  if (!slotData[productId]) {
    slotData[productId] = {
      week: weekKey,
      extra: 0,
      used: 0
    };
  }

  if (
    slotData[productId].week !==
    weekKey
  ) {
    slotData[productId].week =
      weekKey;

    slotData[productId].used = 0;
  }

  slotData[productId].extra +=
    amount;

  return interaction.reply({
    content:
      `✅ Berhasil menambahkan **${amount} slot** untuk **${product.name}**.\n\nSlot tersedia sekarang: **${getSlot(productId)}**`,
    ephemeral: true
  });
}

// ===============================
// HANDLE CATALOG INTERACTION
// ===============================

async function handleCatalogInteraction(
  interaction
) {
  if (!interaction.isButton()) {
    return;
  }

  if (
    !interaction.customId.startsWith(
      "catalog_order_"
    )
  ) {
    return;
  }

  const productId =
    interaction.customId.replace(
      "catalog_order_",
      ""
    );

  const product =
    PRODUCTS[productId];

    if (!product) {
    return interaction.reply({
      content:
        "❌ Produk tidak ditemukan.",
      ephemeral: true
    });
  }

  const available =
    getSlot(productId);

  if (available <= 0) {
    return interaction.reply({
      content:
        "❌ Slot produk ini sedang habis.",
      ephemeral: true
    });
  }

  return interaction.reply({
    content:
      `🛒 **${product.name}**\n\n` +
      `Harga: **${formatPrice(product)}**\n` +
      `Slot tersedia: **${available}**\n\n` +
      `Silakan lanjutkan pemesanan melalui ticket Monroe Community.`,
    ephemeral: true
  });
}

// ===============================
// AUTOCOMPLETE
// ===============================

async function handleCatalogAutocomplete(
  interaction
) {
  if (!interaction.isAutocomplete()) {
    return;
  }

  const focused =
    interaction.options.getFocused()
      .toLowerCase();

  const choices =
    Object.values(PRODUCTS)
      .filter(product =>
        product.id
          .toLowerCase()
          .includes(focused) ||
        product.name
          .toLowerCase()
          .includes(focused)
      )
      .slice(0, 25)
      .map(product => ({
        name:
          `${product.name} — ${product.id}`,
        value: product.id
      }));

  return interaction.respond(
    choices
  );
}

// ===============================
// EXPORT
// ===============================

module.exports = {
  catalogCommand,
  setSlotCommand,
  addSlotCommand,

  PRODUCTS,
  CATEGORIES,
  CATALOG_CHANNELS,

  isStaff,

  getSlot,
  useSlot,

  handleCatalogCommand,
  handleCatalogInteraction,
  handleSetSlot,
  handleAddSlot,
  handleCatalogAutocomplete,

  sendProduct,
  sendAllProducts,
  buildProductEmbed,
  buildProductButton
};