const fs = require("fs");
const path = require("path");

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");

// =====================================================
// DATA
// =====================================================

const DATA_DIR = path.join(__dirname, "..", "app", "data");
const DATA_FILE = path.join(DATA_DIR, "catalog.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const catalogs = new Map();

// =====================================================
// DEFAULT DATA
// =====================================================

function defaultCatalog() {
  return {
    title: "",
    description: "",
    banner: "",
    footer: "",
    products: []
  };
}

// =====================================================
// LOAD DATA
// =====================================================

function loadCatalogs() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return;
    }

    const data = JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );

    for (const [guildId, catalog] of Object.entries(data)) {
      catalogs.set(guildId, catalog);
    }

    console.log("✅ Catalog data berhasil dimuat.");
  } catch (error) {
    console.error(
      "❌ Gagal load catalog:",
      error
    );
  }
}

function saveCatalogs() {
  try {
    const data = Object.fromEntries(catalogs);

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error(
      "❌ Gagal save catalog:",
      error
    );
  }
}

loadCatalogs();

// =====================================================
// GET CATALOG
// =====================================================

function getCatalog(guildId) {
  if (!catalogs.has(guildId)) {
    catalogs.set(
      guildId,
      defaultCatalog()
    );

    saveCatalogs();
  }

  return catalogs.get(guildId);
}

// =====================================================
// COMMANDS
// =====================================================

const catalogCommand =
  new SlashCommandBuilder()
    .setName("setup-catalog")
    .setDescription(
      "Membuka editor Monroe Catalog"
    );

const setSlotCommand =
  new SlashCommandBuilder()
    .setName("setslot")
    .setDescription(
      "Mengatur jumlah slot catalog"
    )
    .addIntegerOption(option =>
      option
        .setName("jumlah")
        .setDescription(
          "Jumlah slot produk"
        )
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(50)
    );

const addSlotCommand =
  new SlashCommandBuilder()
    .setName("addslot")
    .setDescription(
      "Menambahkan slot produk"
    );

// =====================================================
// PERMISSION
// =====================================================

function isAdmin(interaction) {
  return (
    interaction.memberPermissions &&
    interaction.memberPermissions.has(
      "Administrator"
    )
  );
}

// =====================================================
// ERROR
// =====================================================

async function errorReply(
  interaction,
  message = "❌ Terjadi kesalahan."
) {
  const payload = {
    content: message,
    flags: MessageFlags.Ephemeral
  };

  if (
    interaction.replied ||
    interaction.deferred
  ) {
    return interaction.followUp(payload).catch(() => {});
  }

  return interaction.reply(payload).catch(() => {});
}

// =====================================================
// EDITOR
// =====================================================

function buildEditor() {
  const container =
    new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "## 🟧 MONROE CATALOG EDITOR\n" +
      "Kelola tampilan catalog Monroe dari panel ini."
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "### EDIT CATALOG\n" +
      "Pilih bagian yang ingin kamu ubah."
    )
  );

  const row1 =
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          "catalog_edit_title"
        )
        .setLabel("EDIT TITLE")
        .setEmoji("✏️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(
          "catalog_edit_description"
        )
        .setLabel("EDIT DESCRIPTION")
        .setEmoji("📝")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(
          "catalog_edit_banner"
        )
        .setLabel("EDIT BANNER")
        .setEmoji("🖼️")
        .setStyle(ButtonStyle.Secondary)
    );

  const row2 =
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          "catalog_edit_footer"
        )
        .setLabel("EDIT FOOTER")
        .setEmoji("🔻")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(
          "catalog_add_product"
        )
        .setLabel("ADD PRODUCT")
        .setEmoji("➕")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(
          "catalog_preview"
        )
        .setLabel("PREVIEW")
        .setEmoji("👁️")
        .setStyle(ButtonStyle.Secondary)
    );

  const row3 =
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          "catalog_publish"
        )
        .setLabel("PUBLISH")
        .setEmoji("📢")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(
          "catalog_reset"
        )
        .setLabel("RESET")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)
    );

  container.addActionRowComponents(
    row1,
    row2,
    row3
  );

  return container;
}

// =====================================================
// CATALOG DISPLAY
// =====================================================

function buildCatalog(guildId) {
  const catalog =
    getCatalog(guildId);

  const container =
    new ContainerBuilder();

  const title =
    catalog.title?.trim()
      ? catalog.title
      : "🟧 MONROE COMMUNITY STORE";

  const description =
    catalog.description?.trim()
      ? catalog.description
      : "Pilih produk yang tersedia di bawah.";

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# ${title}`
    )
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      description
    )
  );

  if (catalog.banner) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `[🖼️ Banner](${catalog.banner})`
      )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  if (
    !catalog.products ||
    catalog.products.length === 0
  ) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "### 📦 PRODUCT\n" +
        "Belum ada produk yang ditambahkan."
      )
    );
  } else {
    for (
      let i = 0;
      i < catalog.products.length;
      i++
    ) {
      const product =
        catalog.products[i];

      const productTitle =
        product.name?.trim()
          ? product.name
          : `Product ${i + 1}`;

      let text =
        `### ${productTitle}\n`;

      if (product.description) {
        text +=
          `${product.description}\n`;
      }

      if (product.price) {
        text +=
          `💰 **${product.price}**\n`;
      }

      if (product.category) {
        text +=
          `📂 ${product.category}\n`;
      }

      if (product.image) {
        text +=
          `[🖼️ Product Image](${product.image})\n`;
      }

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          text
        )
      );

      const orderButton =
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(
              `catalog_order_${product.id}`
            )
            .setLabel("ORDER")
            .setEmoji("🛒")
            .setStyle(
              ButtonStyle.Primary
            )
        );

      container.addActionRowComponents(
        orderButton
      );

      if (
        i <
        catalog.products.length - 1
      ) {
        container.addSeparatorComponents(
          new SeparatorBuilder()
        );
      }
    }
  }

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

// =====================================================
// TITLE MODAL
// =====================================================

function showTitleModal(interaction) {
  const modal =
    new ModalBuilder()
      .setCustomId(
        "catalog_modal_title"
      )
      .setTitle(
        "Edit Catalog Title"
      );

  const input =
    new TextInputBuilder()
      .setCustomId(
        "catalog_title"
      )
      .setLabel("Catalog Title")
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setMaxLength(100)
      .setPlaceholder(
        "MONROE COMMUNITY STORE"
      );

  const row =
    new ActionRowBuilder()
      .addComponents(input);

  modal.addComponents(row);

  return interaction.showModal(modal);
}

// =====================================================
// DESCRIPTION MODAL
// =====================================================

function showDescriptionModal(
  interaction
) {
  const modal =
    new ModalBuilder()
      .setCustomId(
        "catalog_modal_description"
      )
      .setTitle(
        "Edit Catalog Description"
      );

  const input =
    new TextInputBuilder()
      .setCustomId(
        "catalog_description"
      )
      .setLabel("Description")
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(false)
      .setMaxLength(1000)
      .setPlaceholder(
        "Tulis deskripsi catalog..."
      );

  const row =
    new ActionRowBuilder()
      .addComponents(input);

  modal.addComponents(row);

  return interaction.showModal(modal);
}

// =====================================================
// BANNER MODAL
// =====================================================

function showBannerModal(
  interaction
) {
  const modal =
    new ModalBuilder()
      .setCustomId(
        "catalog_modal_banner"
      )
      .setTitle(
        "Edit Catalog Banner"
      );

  const input =
    new TextInputBuilder()
      .setCustomId(
        "catalog_banner"
      )
      .setLabel("Banner URL")
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setPlaceholder(
        "https://..."
      );

  const row =
    new ActionRowBuilder()
      .addComponents(input);

  modal.addComponents(row);

  return interaction.showModal(modal);
}

// =====================================================
// FOOTER MODAL
// =====================================================

function showFooterModal(
  interaction
) {
  const modal =
    new ModalBuilder()
      .setCustomId(
        "catalog_modal_footer"
      )
      .setTitle(
        "Edit Catalog Footer"
      );

  const input =
    new TextInputBuilder()
      .setCustomId(
        "catalog_footer"
      )
      .setLabel("Footer")
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setMaxLength(200)
      .setPlaceholder(
        "MONROE COMMUNITY © 2026"
      );

  const row =
    new ActionRowBuilder()
      .addComponents(input);

  modal.addComponents(row);

  return interaction.showModal(modal);
}

// =====================================================
// PRODUCT CATEGORY MENU
// =====================================================

async function showProductCategory(
  interaction
) {
  const menu =
    new StringSelectMenuBuilder()
      .setCustomId(
        "catalog_product_category"
      )
      .setPlaceholder(
        "Pilih kategori produk..."
      )
      .addOptions(
        {
          label: "Build Discord",
          value: "build_discord",
          emoji: "💬"
        },
        {
          label: "Setup Bot",
          value: "setup_bot",
          emoji: "🤖"
        },
        {
          label: "Build Modpack",
          value: "build_modpack",
          emoji: "🎮"
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
      "### 📦 ADD PRODUCT\n" +
      "Pilih kategori produk:",
    components: [row],
    flags: MessageFlags.Ephemeral
  });

  return true;
}

// =====================================================
// PRODUCT MODAL
// =====================================================

function showProductModal(
  interaction,
  category
) {
  const modal =
    new ModalBuilder()
      .setCustomId(
        `catalog_product_modal_${category}`
      )
      .setTitle(
        "Add Product"
      );

  const name =
    new TextInputBuilder()
      .setCustomId(
        "product_name"
      )
      .setLabel("Product Name")
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(true)
      .setMaxLength(100)
      .setPlaceholder(
        "Nama produk"
      );

  const description =
    new TextInputBuilder()
      .setCustomId(
        "product_description"
      )
      .setLabel("Product Description")
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(false)
      .setMaxLength(1000)
      .setPlaceholder(
        "Deskripsi produk"
      );

  const price =
    new TextInputBuilder()
      .setCustomId(
        "product_price"
      )
      .setLabel("Product Price")
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setMaxLength(100)
      .setPlaceholder(
        "Rp10.000"
      );

  const image =
    new TextInputBuilder()
      .setCustomId(
        "product_image"
      )
      .setLabel("Product Image URL")
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setPlaceholder(
        "https://..."
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(name),

    new ActionRowBuilder()
      .addComponents(description),

    new ActionRowBuilder()
      .addComponents(price),

    new ActionRowBuilder()
      .addComponents(image)
  );

  return interaction.showModal(modal);
}

// =====================================================
// HANDLE PRODUCT CATEGORY
// =====================================================

async function handleProductCategory(
  interaction
) {
  const category =
    interaction.values?.[0];

  if (!category) {
    return false;
  }

  await showProductModal(
    interaction,
    category
  );

  return true;
}

// =====================================================
// HANDLE PRODUCT MODAL
// =====================================================

async function handleProductModal(
  interaction
) {
  const customId =
    interaction.customId || "";

  const category =
    customId.replace(
      "catalog_product_modal_",
      ""
    );

  const catalog =
    getCatalog(
      interaction.guildId
    );

  const product = {
    id:
      Date.now().toString(),

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
      ),

    image:
      interaction.fields.getTextInputValue(
        "product_image"
      )
  };

  catalog.products.push(
    product
  );

  saveCatalogs();

  await interaction.reply({
    content:
      "✅ Product berhasil ditambahkan ke catalog.",
    flags: MessageFlags.Ephemeral
  });

  return true;
}

// =====================================================
// HANDLE MODALS
// =====================================================

async function handleCatalogModals(
  interaction
) {
  const id =
    interaction.customId || "";

  const catalog =
    getCatalog(
      interaction.guildId
    );

  // TITLE
  if (
    id ===
    "catalog_modal_title"
  ) {
    catalog.title =
      interaction.fields.getTextInputValue(
        "catalog_title"
      );

    saveCatalogs();

    await interaction.reply({
      content:
        "✅ Title catalog berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // DESCRIPTION
  if (
    id ===
    "catalog_modal_description"
  ) {
    catalog.description =
      interaction.fields.getTextInputValue(
        "catalog_description"
      );

    saveCatalogs();

    await interaction.reply({
      content:
        "✅ Description catalog berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // BANNER
  if (
    id ===
    "catalog_modal_banner"
  ) {
    catalog.banner =
      interaction.fields.getTextInputValue(
        "catalog_banner"
      );

    saveCatalogs();

    await interaction.reply({
      content:
        "✅ Banner catalog berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // FOOTER
  if (
    id ===
    "catalog_modal_footer"
  ) {
    catalog.footer =
      interaction.fields.getTextInputValue(
        "catalog_footer"
      );

    saveCatalogs();

    await interaction.reply({
      content:
        "✅ Footer catalog berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // PRODUCT
  if (
    id.startsWith(
      "catalog_product_modal_"
    )
  ) {
    return await handleProductModal(
      interaction
    );
  }

  return false;
}

// =====================================================
// PUBLISH
// =====================================================

async function publishCatalog(
  interaction
) {
  if (!isAdmin(interaction)) {
    return await errorReply(
      interaction,
      "❌ Kamu membutuhkan permission Administrator."
    );
  }

  const catalog =
    getCatalog(
      interaction.guildId
    );

  if (
    !catalog.title &&
    !catalog.description &&
    catalog.products.length === 0
  ) {
    return await errorReply(
      interaction,
      "❌ Catalog masih kosong."
    );
  }

  const container =
    buildCatalog(
      interaction.guildId
    );

  await interaction.reply({
    components: [container],
    flags:
      MessageFlags.IsComponentsV2
  });

  return true;
}

// =====================================================
// RESET
// =====================================================

async function resetCatalog(
  interaction
) {
  if (!isAdmin(interaction)) {
    return await errorReply(
      interaction,
      "❌ Kamu membutuhkan permission Administrator."
    );
  }

  catalogs.set(
    interaction.guildId,
    defaultCatalog()
  );

  saveCatalogs();

  await interaction.reply({
    content:
      "🗑️ Catalog berhasil di-reset.",
    flags: MessageFlags.Ephemeral
  });

  return true;
}

// =====================================================
// PREVIEW
// =====================================================

async function previewCatalog(
  interaction
) {
  const container =
    buildCatalog(
      interaction.guildId
    );

  await interaction.reply({
    components: [container],
    flags:
      MessageFlags.Ephemeral |
      MessageFlags.IsComponentsV2
  });

  return true;
}

// =====================================================
// CATALOG BUTTONS
// =====================================================

async function handleCatalogInteraction(
  interaction
) {
  if (!interaction.isButton()) {
    return false;
  }

  const id =
    interaction.customId || "";

  // EDIT TITLE
  if (
    id ===
    "catalog_edit_title"
  ) {
    if (!isAdmin(interaction)) {
      return await errorReply(
        interaction,
        "❌ Kamu membutuhkan permission Administrator."
      );
    }

    await showTitleModal(
      interaction
    );

    return true;
  }

  // EDIT DESCRIPTION
  if (
    id ===
    "catalog_edit_description"
  ) {
    if (!isAdmin(interaction)) {
      return await errorReply(
        interaction,
        "❌ Kamu membutuhkan permission Administrator."
      );
    }

    await showDescriptionModal(
      interaction
    );

    return true;
  }

  // EDIT BANNER
  if (
    id ===
    "catalog_edit_banner"
  ) {
    if (!isAdmin(interaction)) {
      return await errorReply(
        interaction,
        "❌ Kamu membutuhkan permission Administrator."
      );
    }

    await showBannerModal(
      interaction
    );

    return true;
  }

  // EDIT FOOTER
  if (
    id ===
    "catalog_edit_footer"
  ) {
    if (!isAdmin(interaction)) {
      return await errorReply(
        interaction,
        "❌ Kamu membutuhkan permission Administrator."
      );
    }

    await showFooterModal(
      interaction
    );

    return true;
  }

  // ADD PRODUCT
  if (
    id ===
    "catalog_add_product"
  ) {
    if (!isAdmin(interaction)) {
      return await errorReply(
        interaction,
        "❌ Kamu membutuhkan permission Administrator."
      );
    }

    return await showProductCategory(
      interaction
    );
  }

  // PREVIEW
  if (
    id ===
    "catalog_preview"
  ) {
    return await previewCatalog(
      interaction
    );
  }

  // ORDER
  if (
    id.startsWith(
      "catalog_order_"
    )
  ) {
    const productId =
      id.replace(
        "catalog_order_",
        ""
      );

    const catalog =
      getCatalog(
        interaction.guildId
      );

    const product =
      catalog.products.find(
        item =>
          item.id === productId
      );

    if (!product) {
      return await errorReply(
        interaction,
        "❌ Product tidak ditemukan."
      );
    }

    await interaction.reply({
      content:
        `🛒 **ORDER**\n\n` +
        `📦 **Product:** ${product.name}\n` +
        `💰 **Price:** ${product.price || "Contact Staff"}\n\n` +
        `Silakan hubungi staff untuk melanjutkan order.`,
      flags:
        MessageFlags.Ephemeral
    });

    return true;
  }

  return false;
}

// =====================================================
// MAIN CATALOG HANDLER
// =====================================================

async function handleCatalog(
  interaction
) {
  const id =
    interaction.customId || "";

  // MODALS
  if (
    interaction.isModalSubmit()
  ) {
    if (
      id.startsWith(
        "catalog_modal_"
      ) ||
      id.startsWith(
        "catalog_product_modal_"
      )
    ) {
      return await handleCatalogModals(
        interaction
      );
    }
  }

  // SELECT MENU
  if (
    interaction.isStringSelectMenu()
  ) {
    if (
      id ===
      "catalog_product_category"
    ) {
      return await handleProductCategory(
        interaction
      );
    }
  }

  // BUTTONS
  if (
    interaction.isButton()
  ) {
    if (
      id ===
      "catalog_publish"
    ) {
      return await publishCatalog(
        interaction
      );
    }

    if (
      id ===
      "catalog_reset"
    ) {
      return await resetCatalog(
        interaction
      );
    }
  }

  return false;
}

// =====================================================
// SETUP CATALOG COMMAND
// =====================================================

async function handleCatalogCommand(
  interaction
) {
  if (!isAdmin(interaction)) {
    return await errorReply(
      interaction,
      "❌ Kamu membutuhkan permission Administrator."
    );
  }

  getCatalog(
    interaction.guildId
  );

  const editor =
    buildEditor();

  await interaction.reply({
    components: [editor],
    flags:
      MessageFlags.Ephemeral |
      MessageFlags.IsComponentsV2
  });

  return true;
}

// =====================================================
// SET SLOT
// =====================================================

async function handleSetSlot(
  interaction
) {
  if (!isAdmin(interaction)) {
    return await errorReply(
      interaction,
      "❌ Kamu membutuhkan permission Administrator."
    );
  }

  const jumlah =
    interaction.options.getInteger(
      "jumlah"
    );

  const catalog =
    getCatalog(
      interaction.guildId
    );

  while (
    catalog.products.length >
    jumlah
  ) {
    catalog.products.pop();
  }

  while (
    catalog.products.length <
    jumlah
  ) {
    catalog.products.push({
      id:
        Date.now().toString() +
        Math.random()
          .toString(36)
          .slice(2, 8),

      category: "",

      name: "",

      description: "",

      price: "",

      image: ""
    });
  }

  saveCatalogs();

  await interaction.reply({
    content:
      `✅ Catalog sekarang memiliki **${jumlah} slot**.`,
    flags:
      MessageFlags.Ephemeral
  });

  return true;
}

// =====================================================
// ADD SLOT
// =====================================================

async function handleAddSlot(
  interaction
) {
  if (!isAdmin(interaction)) {
    return await errorReply(
      interaction,
      "❌ Kamu membutuhkan permission Administrator."
    );
  }

  const catalog =
    getCatalog(
      interaction.guildId
    );

  catalog.products.push({
    id:
      Date.now().toString() +
      Math.random()
        .toString(36)
        .slice(2, 8),

    category: "",

    name: "",

    description: "",

    price: "",

    image: ""
  });

  saveCatalogs();

  await interaction.reply({
    content:
      "✅ 1 slot product berhasil ditambahkan.",
    flags:
      MessageFlags.Ephemeral
  });

  return true;
}

// =====================================================
// AUTOCOMPLETE
// =====================================================

async function handleCatalogAutocomplete(
  interaction
) {
  if (!interaction.isAutocomplete()) {
    return false;
  }

  return true;
}

// =====================================================
// EXPORT
// =====================================================

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