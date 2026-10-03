const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");

// ========================================
// DATA
// ========================================

const catalogs = new Map();

// ========================================
// /SETUP-CATALOG
// ========================================

const catalogCommand = new SlashCommandBuilder()
  .setName("setup-catalog")
  .setDescription("Open Monroe Catalog editor");

// ========================================
// /SET-SLOT
// ========================================

const setSlotCommand = new SlashCommandBuilder()
  .setName("setslot")
  .setDescription("Set catalog slot")
  .addIntegerOption(option =>
    option
      .setName("slot")
      .setDescription("Slot number")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(20)
  );

// ========================================
// /ADD-SLOT
// ========================================

const addSlotCommand = new SlashCommandBuilder()
  .setName("addslot")
  .setDescription("Add product to catalog")
  .addStringOption(option =>
    option
      .setName("category")
      .setDescription("Product category")
      .setRequired(true)
  );

// ========================================
// EMPTY CATALOG
// ========================================

function getCatalog(guildId) {

  if (!catalogs.has(guildId)) {

    catalogs.set(guildId, {
      title: "MONROE COMMUNITY STORE",
      description: "",
      banner: "",
      footer: "",
      products: []
    });

  }

  return catalogs.get(guildId);
}

// ========================================
// CATALOG PREVIEW
// ========================================

function buildCatalog(guildId) {

  const catalog = getCatalog(guildId);

  const container = new ContainerBuilder()
    .setAccentColor(0xff8c00);

  // TITLE

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# 🟧 ${catalog.title}`
    )
  );

  // DESCRIPTION

  if (catalog.description) {

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        catalog.description
      )
    );

  }

  // PRODUCTS

  if (catalog.products.length > 0) {

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );

    let productText = "";

    catalog.products.forEach(
      (product, index) => {

        productText +=
          `**${index + 1}. ${product.name}**\n`;

        if (product.description) {

          productText +=
            `${product.description}\n`;

        }

        if (product.price) {

          productText +=
            `💰 ${product.price}\n`;

        }

        productText += "\n";

      }
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        productText
      )
    );

  } else {

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "*Catalog masih kosong.*"
      )
    );

  }

  // FOOTER

  if (catalog.footer) {

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        catalog.footer
      )
    );

  }

  return container;
}

// ========================================
// EDITOR
// ========================================

function buildEditor(guildId) {

  const catalog = getCatalog(guildId);

  const container = new ContainerBuilder()
    .setAccentColor(0xff8c00);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "# 🟧 MONROE CATALOG EDITOR\n" +
      "Edit catalog kamu menggunakan tombol di bawah."
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Title:** ${catalog.title || "-"}\n` +
      `**Products:** ${catalog.products.length}\n` +
      `**Banner:** ${catalog.banner ? "Set" : "Empty"}\n` +
      `**Footer:** ${catalog.footer || "-"}`
    )
  );

  const row1 = new ActionRowBuilder()
    .addComponents(

      new ButtonBuilder()
        .setCustomId("catalog_edit_title")
        .setLabel("EDIT TITLE")
        .setEmoji("📝")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("catalog_add_product")
        .setLabel("ADD PRODUCT")
        .setEmoji("➕")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("catalog_preview")
        .setLabel("PREVIEW")
        .setEmoji("👁️")
        .setStyle(ButtonStyle.Secondary)

    );

  const row2 = new ActionRowBuilder()
    .addComponents(

      new ButtonBuilder()
        .setCustomId("catalog_publish")
        .setLabel("PUBLISH")
        .setEmoji("📤")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("catalog_reset")
        .setLabel("RESET")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)

    );

  container.addActionRowComponents(
    row1,
    row2
  );

  return container;
}

// ========================================
// SETUP CATALOG
// ========================================

async function handleCatalogCommand(
  interaction
) {

  const guildId = interaction.guildId;

  getCatalog(guildId);

  await interaction.reply({

    components: [
      buildEditor(guildId)
    ],

    flags:
      MessageFlags.IsComponentsV2 |
      MessageFlags.Ephemeral

  });

}

// ========================================
// ADD PRODUCT
// ========================================

async function showAddProductMenu(
  interaction
) {

  const menu =
    new StringSelectMenuBuilder()
      .setCustomId("catalog_product_type")
      .setPlaceholder("Select product category")
      .addOptions(

        {
          label: "Build Discord",
          value: "build_discord",
          emoji: "🛠️"
        },

        {
          label: "Set Up Bot",
          value: "setup_bot",
          emoji: "🤖"
        },

        {
          label: "Build Modpack",
          value: "build_modpack",
          emoji: "📦"
        },

        {
          label: "Design",
          value: "design",
          emoji: "🎨"
        },

        {
          label: "Rekber",
          value: "rekber",
          emoji: "💰"
        }

      );

  const row =
    new ActionRowBuilder()
      .addComponents(menu);

  await interaction.reply({

    content:
      "Pilih kategori produk:",

    components: [row],

    flags: MessageFlags.Ephemeral

  });

}

// ========================================
// PRODUCT MODAL
// ========================================

async function showProductModal(
  interaction,
  category
) {

  const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
  } = require("discord.js");

  const modal =
    new ModalBuilder()
      .setCustomId(
        `catalog_product_modal_${category}`
      )
      .setTitle("Add Catalog Product");

  const name =
    new TextInputBuilder()
      .setCustomId("product_name")
      .setLabel("Product Name")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100);

  const description =
    new TextInputBuilder()
      .setCustomId("product_description")
      .setLabel("Description")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(1000);

  const price =
    new TextInputBuilder()
      .setCustomId("product_price")
      .setLabel("Price")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Contoh: Rp10.000")
      .setRequired(false)
      .setMaxLength(50);

  modal.addComponents(

    new ActionRowBuilder()
      .addComponents(name),

    new ActionRowBuilder()
      .addComponents(description),

    new ActionRowBuilder()
      .addComponents(price)

  );

  await interaction.showModal(modal);

}

// ========================================
// INTERACTION
// ========================================

async function handleCatalogInteraction(
  interaction
) {

  const id = interaction.customId;

  // ADD PRODUCT

  if (id === "catalog_add_product") {

    return await showAddProductMenu(
      interaction
    );

  }

  // CATEGORY

  if (id === "catalog_product_type") {

    const category =
      interaction.values[0];

    return await showProductModal(
      interaction,
      category
    );

  }

  // PREVIEW

  if (id === "catalog_preview") {

    return await interaction.reply({

      components: [
        buildCatalog(interaction.guildId)
      ],

      flags:
        MessageFlags.IsComponentsV2 |
        MessageFlags.Ephemeral

    });

  }

  // PUBLISH

  if (id === "catalog_publish") {

    return await interaction.reply({

      content:
        "📤 Catalog siap dipublish.\n\n" +
        "Untuk sekarang editor sudah menyimpan " +
        "produk selama bot berjalan.",

      flags: MessageFlags.Ephemeral

    });

  }

  // RESET

  if (id === "catalog_reset") {

    catalogs.set(
      interaction.guildId,
      {
        title: "MONROE COMMUNITY STORE",
        description: "",
        banner: "",
        footer: "",
        products: []
      }
    );

    return await interaction.update({

      components: [
        buildEditor(interaction.guildId)
      ],

      flags:
        MessageFlags.IsComponentsV2 |
        MessageFlags.Ephemeral

    });

  }

  return false;

}

// ========================================
// MODAL HANDLER
// ========================================

async function handleCatalogCommandInteraction(
  interaction
) {

  if (
    !interaction.isModalSubmit()
  ) {
    return false;
  }

  if (
    !interaction.customId.startsWith(
      "catalog_product_modal_"
    )
  ) {
    return false;
  }

  const category =
    interaction.customId.replace(
      "catalog_product_modal_",
      ""
    );

  const catalog =
    getCatalog(interaction.guildId);

  catalog.products.push({

    category,

    name:
      interaction.fields.getTextInputValue(
        "product_name"
      ),

    description:
      interaction.fields.getTextInputValue(
        "product_description"
      ),

    price:
      interaction.fields.getTextInputValue(
        "product_price"
      )

  });

  await interaction.reply({

    content:
      "✅ Product berhasil ditambahkan ke catalog.",

    flags: MessageFlags.Ephemeral

  });

  return true;

}

// ========================================
// SET SLOT
// ========================================

async function handleSetSlot(
  interaction
) {

  await interaction.reply({

    content:
      "🛠️ Sistem slot sedang disiapkan.",

    flags: MessageFlags.Ephemeral

  });

}

// ========================================
// ADD SLOT
// ========================================

async function handleAddSlot(
  interaction
) {

  await interaction.reply({

    content:
      "🛠️ Sistem add slot sedang disiapkan.",

    flags: MessageFlags.Ephemeral

  });

}

// ========================================
// AUTOCOMPLETE
// ========================================

async function handleCatalogAutocomplete(
  interaction
) {

  if (
    !interaction.isAutocomplete()
  ) {
    return;
  }

  await interaction.respond([]);

}

// ========================================
// EXPORT
// ========================================

module.exports = {
  catalogCommand,
  setSlotCommand,
  addSlotCommand,

  handleCatalogCommand,
  handleCatalogInteraction,
  handleCatalog,

  handleSetSlot,
  handleAddSlot,
  handleCatalogAutocomplete,

  buildCatalog
};