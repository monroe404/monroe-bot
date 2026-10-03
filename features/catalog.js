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

const DATA_DIR = path.join(
  __dirname,
  "..",
  "app",
  "data"
);

const DATA_FILE = path.join(
  DATA_DIR,
  "catalog.json"
);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {
    recursive: true
  });
}

const catalogs = new Map();

// =====================================================
// DEFAULT CATALOG
// =====================================================

function defaultCatalog() {
  return {
    title: "Build Discord Section",

    description:
      "Pilih produk yang tersedia di bawah.",

    buttonText:
      "📝 Click for product description...",

    banner: "",

    footer: "",

    products: [
      {
        id: "community",
        name: "Create Discord Community",
        description: "",
        packageA: "",
        priceA: "",
        packageB: "",
        priceB: "",
        image: ""
      },

      {
        id: "roleplay",
        name: "Create Discord Roleplay",
        description: "",
        packageA: "",
        priceA: "",
        packageB: "",
        priceB: "",
        image: ""
      },

      {
        id: "faction",
        name: "Create Discord Faction",
        description: "",
        packageA: "",
        priceA: "",
        packageB: "",
        priceB: "",
        image: ""
      },

      {
        id: "store",
        name: "Create Discord Store",
        description: "",
        packageA: "",
        priceA: "",
        packageB: "",
        priceB: "",
        image: ""
      }
    ]
  };
}

// =====================================================
// LOAD
// =====================================================

function loadCatalogs() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return;
    }

    const data = JSON.parse(
      fs.readFileSync(
        DATA_FILE,
        "utf8"
      )
    );

    for (
      const [guildId, catalog]
      of Object.entries(data)
    ) {
      catalogs.set(
        guildId,
        catalog
      );
    }

    console.log(
      "✅ Catalog data loaded."
    );

  } catch (error) {
    console.error(
      "❌ Catalog load error:",
      error
    );
  }
}

function saveCatalogs() {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        Object.fromEntries(catalogs),
        null,
        2
      )
    );
  } catch (error) {
    console.error(
      "❌ Catalog save error:",
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
// ADMIN CHECK
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
  message
) {

  const payload = {
    content:
      message ||
      "❌ Terjadi kesalahan.",

    flags:
      MessageFlags.Ephemeral
  };

  if (
    interaction.replied ||
    interaction.deferred
  ) {

    return interaction
      .followUp(payload)
      .catch(() => {});
  }

  return interaction
    .reply(payload)
    .catch(() => {});
}

// =====================================================
// SLASH COMMANDS
// =====================================================

const catalogCommand =
  new SlashCommandBuilder()
    .setName("setup-catalog")
    .setDescription(
      "Membuka catalog editor Monroe."
    );

const setSlotCommand =
  new SlashCommandBuilder()
    .setName("setslot")
    .setDescription(
      "Mengatur jumlah produk catalog."
    )
    .addIntegerOption(option =>
      option
        .setName("jumlah")
        .setDescription(
          "Jumlah produk."
        )
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    );

const addSlotCommand =
  new SlashCommandBuilder()
    .setName("addslot")
    .setDescription(
      "Menambahkan produk catalog."
    );

// =====================================================
// EDITOR PANEL
// =====================================================

function buildEditor() {

  const container =
    new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        "# 🟧 MONROE CATALOG EDITOR\n" +
        "Atur tampilan catalog dan produk dari panel ini."
      )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        "### CATALOG SETTINGS\n" +
        "Edit bagian utama catalog."
      )
  );

  // ROW 1
  const row1 =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_title"
          )
          .setLabel(
            "EDIT TITLE"
          )
          .setEmoji("✏️")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_description"
          )
          .setLabel(
            "EDIT DESCRIPTION"
          )
          .setEmoji("📝")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_button"
          )
          .setLabel(
            "EDIT BUTTON"
          )
          .setEmoji("🔘")
          .setStyle(
            ButtonStyle.Secondary
          )
      );

  // ROW 2
  const row2 =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_products"
          )
          .setLabel(
            "EDIT PRODUCTS"
          )
          .setEmoji("📦")
          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_banner"
          )
          .setLabel(
            "EDIT BANNER"
          )
          .setEmoji("🖼️")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_footer"
          )
          .setLabel(
            "EDIT FOOTER"
          )
          .setEmoji("🔻")
          .setStyle(
            ButtonStyle.Secondary
          )
      );

  // ROW 3
  const row3 =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_preview"
          )
          .setLabel(
            "PREVIEW"
          )
          .setEmoji("👁️")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_publish"
          )
          .setLabel(
            "PUBLISH"
          )
          .setEmoji("📢")
          .setStyle(
            ButtonStyle.Success
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_reset"
          )
          .setLabel(
            "RESET"
          )
          .setEmoji("🗑️")
          .setStyle(
            ButtonStyle.Danger
          )
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

function buildCatalog(
  guildId
) {

  const catalog =
    getCatalog(guildId);

  const container =
    new ContainerBuilder();

  // TITLE
  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        `# ${catalog.title || "Build Discord Section"}`
      )
  );

  // DESCRIPTION
  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(
        catalog.description ||
        "Pilih produk yang tersedia di bawah."
      )
  );

  // BANNER
  if (
    catalog.banner &&
    catalog.banner.trim()
  ) {

    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `[🖼️ Banner](${catalog.banner})`
        )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  // PRODUCTS
  if (
    !catalog.products ||
    catalog.products.length === 0
  ) {

    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          "Belum ada produk."
        )
    );

  } else {

    for (
      const product
      of catalog.products
    ) {

      if (!product.name) {
        continue;
      }

      container.addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(
            `### ${product.name}`
          )
      );
    }
  }

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  // DESCRIPTION BUTTON
  const descriptionButton =
    new ButtonBuilder()
      .setCustomId(
        "catalog_product_description"
      )
      .setLabel(
        (
          catalog.buttonText ||
          "Click for product description..."
        ).slice(0, 80)
      )
      .setEmoji("📝")
      .setStyle(
        ButtonStyle.Secondary
      );

  container.addActionRowComponents(
    new ActionRowBuilder()
      .addComponents(
        descriptionButton
      )
  );

  // FOOTER
  if (
    catalog.footer &&
    catalog.footer.trim()
  ) {

    container.addSeparatorComponents(
      new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          catalog.footer
        )
    );
  }

  return container;
}

// =====================================================
// PRODUCT SELECT MENU
// =====================================================

function buildProductSelect(
  guildId
) {

  const catalog =
    getCatalog(guildId);

  const options = [];

  for (
    const product
    of catalog.products
  ) {

    if (!product.name) {
      continue;
    }

    options.push({
      label:
        product.name.slice(
          0,
          100
        ),

      value:
        `catalog_product_${product.id}`,

      emoji: "📦"
    });
  }

  if (
    options.length === 0
  ) {

    options.push({
      label:
        "No products available",

      value:
        "catalog_no_product",

      emoji: "📦"
    });
  }

  const menu =
    new StringSelectMenuBuilder()
      .setCustomId(
        "catalog_product_select"
      )
      .setPlaceholder(
        "Select a product..."
      )
      .addOptions(
        options.slice(0, 25)
      );

  return new ActionRowBuilder()
    .addComponents(menu);
}

// =====================================================
// TITLE MODAL
// =====================================================

async function showTitleModal(
  interaction
) {

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
      .setLabel(
        "Catalog Title"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setMaxLength(100)
      .setPlaceholder(
        "Build Discord Section"
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(input)
  );

  return interaction.showModal(
    modal
  );
}

// =====================================================
// DESCRIPTION MODAL
// =====================================================

async function showDescriptionModal(
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
      .setLabel(
        "Catalog Description"
      )
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(false)
      .setMaxLength(1000)
      .setPlaceholder(
        "Pilih produk yang tersedia di bawah."
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(input)
  );

  return interaction.showModal(
    modal
  );
}

// =====================================================
// BUTTON TEXT MODAL
// =====================================================

async function showButtonModal(
  interaction
) {

  const modal =
    new ModalBuilder()
      .setCustomId(
        "catalog_modal_button"
      )
      .setTitle(
        "Edit Description Button"
      );

  const input =
    new TextInputBuilder()
      .setCustomId(
        "catalog_button"
      )
      .setLabel(
        "Button Text"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(true)
      .setMaxLength(80)
      .setPlaceholder(
        "Click for product description..."
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(input)
  );

  return interaction.showModal(
    modal
  );
}

// =====================================================
// BANNER MODAL
// =====================================================

async function showBannerModal(
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
      .setLabel(
        "Banner URL"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setPlaceholder(
        "https://..."
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(input)
  );

  return interaction.showModal(
    modal
  );
}

// =====================================================
// FOOTER MODAL
// =====================================================

async function showFooterModal(
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
      .setLabel(
        "Footer"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setMaxLength(200)
      .setPlaceholder(
        "MONROE COMMUNITY © 2026"
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(input)
  );

  return interaction.showModal(
    modal
  );
}

// =====================================================
// PRODUCT EDIT SELECT
// =====================================================

async function showProductEditor(
  interaction
) {

  const row =
    buildProductSelect(
      interaction.guildId
    );

  await interaction.reply({
    content:
      "### 📦 EDIT PRODUCTS\n" +
      "Pilih produk yang ingin kamu edit.",

    components: [row],

    flags:
      MessageFlags.Ephemeral
  });

  return true;
}

// =====================================================
// PRODUCT EDIT MENU
// =====================================================

async function showProductEditMenu(
  interaction,
  productId
) {

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
      "❌ Produk tidak ditemukan."
    );
  }

  const row =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            `catalog_edit_product_${product.id}`
          )
          .setLabel(
            "EDIT PRODUCT"
          )
          .setEmoji("✏️")
          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()
          .setCustomId(
            `catalog_delete_product_${product.id}`
          )
          .setLabel(
            "DELETE"
          )
          .setEmoji("🗑️")
          .setStyle(
            ButtonStyle.Danger
          )
      );

  await interaction.reply({
    content:
      `### 📦 ${product.name}\n` +
      "Pilih tindakan untuk produk ini.",

    components: [row],

    flags:
      MessageFlags.Ephemeral
  });

  return true;
}

// =====================================================
// ADD PRODUCT MODAL
// =====================================================

async function showAddProductModal(
  interaction
) {

  const modal =
    new ModalBuilder()
      .setCustomId(
        "catalog_modal_add_product"
      )
      .setTitle(
        "Add Product"
      );

  const name =
    new TextInputBuilder()
      .setCustomId(
        "product_name"
      )
      .setLabel(
        "Product Name"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(true)
      .setMaxLength(100)
      .setPlaceholder(
        "Create Discord Community"
      );

  const description =
    new TextInputBuilder()
      .setCustomId(
        "product_description"
      )
      .setLabel(
        "Product Description"
      )
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(false)
      .setMaxLength(1000)
      .setPlaceholder(
        "Isi deskripsi nanti..."
      );

  const packageA =
    new TextInputBuilder()
      .setCustomId(
        "product_package_a"
      )
      .setLabel(
        "Package A"
      )
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(false)
      .setMaxLength(1000)
      .setPlaceholder(
        "Settings Permission..."
      );

  const priceA =
    new TextInputBuilder()
      .setCustomId(
        "product_price_a"
      )
      .setLabel(
        "Package A Price"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(false)
      .setPlaceholder(
        "Rp10.000"
      );

  const packageB =
    new TextInputBuilder()
      .setCustomId(
        "product_package_b"
      )
      .setLabel(
        "Package B"
      )
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(false)
      .setMaxLength(1000)
      .setPlaceholder(
        "Settings + Bot..."
      );

  modal.addComponents(
    new ActionRowBuilder()
      .addComponents(name),

    new ActionRowBuilder()
      .addComponents(description),

    new ActionRowBuilder()
      .addComponents(packageA),

    new ActionRowBuilder()
      .addComponents(priceA),

    new ActionRowBuilder()
      .addComponents(packageB)
  );

  return interaction.showModal(
    modal
  );
}

// ========================================
// SHOW ADD PRODUCT MODAL
// ========================================

async function showAddProductModal(interaction) {

  const modal = new ModalBuilder()
    .setCustomId("catalog_modal_add_product")
    .setTitle("Add Product");

  const nameInput = new TextInputBuilder()
    .setCustomId("product_name")
    .setLabel("Product Name")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("Create Discord Community");

  const descriptionInput = new TextInputBuilder()
    .setCustomId("product_description")
    .setLabel("Product Description")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setPlaceholder("Masukkan deskripsi produk...");

  const packageAInput = new TextInputBuilder()
    .setCustomId("product_package_a")
    .setLabel("Package A")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("Basic Package");

  const priceAInput = new TextInputBuilder()
    .setCustomId("product_price_a")
    .setLabel("Price A")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("Rp50.000");

  const packageBInput = new TextInputBuilder()
    .setCustomId("product_package_b")
    .setLabel("Package B")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("Premium Package");

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(descriptionInput),
    new ActionRowBuilder().addComponents(packageAInput),
    new ActionRowBuilder().addComponents(priceAInput),
    new ActionRowBuilder().addComponents(packageBInput)
  );

  await interaction.showModal(modal);
}

// ========================================
// SHOW EDIT PRODUCT MODAL
// ========================================

async function showEditProductModal(
  interaction,
  productId
) {

  const product =
    catalog.products.find(
      p => p.id === productId
    );

  if (!product) {
    await interaction.reply({
      content: "❌ Product tidak ditemukan.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  const modal = new ModalBuilder()
    .setCustomId(
      `catalog_modal_edit_product_${productId}`
    )
    .setTitle("Edit Product");

  const nameInput = new TextInputBuilder()
    .setCustomId("product_name")
    .setLabel("Product Name")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(product.name || "");

  const descriptionInput = new TextInputBuilder()
    .setCustomId("product_description")
    .setLabel("Product Description")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setValue(product.description || "");

  const packageAInput = new TextInputBuilder()
    .setCustomId("product_package_a")
    .setLabel("Package A")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setValue(product.packageA || "");

  const priceAInput = new TextInputBuilder()
    .setCustomId("product_price_a")
    .setLabel("Price A")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setValue(product.priceA || "");

  const packageBInput = new TextInputBuilder()
    .setCustomId("product_package_b")
    .setLabel("Package B")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setValue(product.packageB || "");

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(descriptionInput),
    new ActionRowBuilder().addComponents(packageAInput),
    new ActionRowBuilder().addComponents(priceAInput),
    new ActionRowBuilder().addComponents(packageBInput)
  );

  await interaction.showModal(modal);

  return true;
}

// ========================================
// HANDLE CATALOG MODALS
// ========================================

async function handleCatalogModals(
  interaction
) {

  const id = interaction.customId;

  if (
    !interaction.isModalSubmit() ||
    !id.startsWith("catalog_")
  ) {
    return false;
  }

  // ----------------------------------------
  // EDIT TITLE
  // ----------------------------------------

  if (id === "catalog_modal_title") {

    catalog.title =
      interaction.fields.getTextInputValue(
        "catalog_title"
      );

    saveCatalog();

    await interaction.reply({
      content: "✅ Catalog title berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // ----------------------------------------
  // EDIT DESCRIPTION
  // ----------------------------------------

  if (id === "catalog_modal_description") {

    catalog.description =
      interaction.fields.getTextInputValue(
        "catalog_description"
      );

    saveCatalog();

    await interaction.reply({
      content:
        "✅ Catalog description berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // ----------------------------------------
  // EDIT BUTTON TEXT
  // ----------------------------------------

  if (id === "catalog_modal_button") {

    catalog.buttonText =
      interaction.fields.getTextInputValue(
        "catalog_button"
      );

    saveCatalog();

    await interaction.reply({
      content:
        "✅ Button text berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // ----------------------------------------
  // EDIT BANNER
  // ----------------------------------------

  if (id === "catalog_modal_banner") {

    catalog.banner =
      interaction.fields.getTextInputValue(
        "catalog_banner"
      );

    saveCatalog();

    await interaction.reply({
      content:
        "✅ Banner berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // ----------------------------------------
  // EDIT FOOTER
  // ----------------------------------------

  if (id === "catalog_modal_footer") {

    catalog.footer =
      interaction.fields.getTextInputValue(
        "catalog_footer"
      );

    saveCatalog();

    await interaction.reply({
      content:
        "✅ Footer berhasil diubah.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // ----------------------------------------
  // ADD PRODUCT
  // ----------------------------------------

  if (id === "catalog_modal_add_product") {

    const name =
      interaction.fields.getTextInputValue(
        "product_name"
      );

    const description =
      interaction.fields.getTextInputValue(
        "product_description"
      );

    const packageA =
      interaction.fields.getTextInputValue(
        "product_package_a"
      );

    const priceA =
      interaction.fields.getTextInputValue(
        "product_price_a"
      );

    const packageB =
      interaction.fields.getTextInputValue(
        "product_package_b"
      );

    const productId =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 30) +
      "_" +
      Date.now().toString().slice(-5);

    catalog.products.push({
      id: productId,
      name,
      description,
      packageA,
      priceA,
      packageB,
      priceB: "",
      image: ""
    });

    saveCatalog();

    await interaction.reply({
      content:
        `✅ Product **${name}** berhasil ditambahkan.`,
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  // ----------------------------------------
  // EDIT PRODUCT
  // ----------------------------------------

  if (
    id.startsWith(
      "catalog_modal_edit_product_"
    )
  ) {

    const productId =
      id.replace(
        "catalog_modal_edit_product_",
        ""
      );

    const product =
      catalog.products.find(
        p => p.id === productId
      );

    if (!product) {

      await interaction.reply({
        content:
          "❌ Product tidak ditemukan.",
        flags: MessageFlags.Ephemeral
      });

      return true;
    }

    product.name =
      interaction.fields.getTextInputValue(
        "product_name"
      );

    product.description =
      interaction.fields.getTextInputValue(
        "product_description"
      );

    product.packageA =
      interaction.fields.getTextInputValue(
        "product_package_a"
      );

    product.priceA =
      interaction.fields.getTextInputValue(
        "product_price_a"
      );

    product.packageB =
      interaction.fields.getTextInputValue(
        "product_package_b"
      );

    saveCatalog();

    await interaction.reply({
      content:
        `✅ Product **${product.name}** berhasil diperbarui.`,
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  return false;
}

// ========================================
// SHOW PRODUCT DESCRIPTION SELECT
// ========================================

async function showProductDescription(
  interaction
) {

  if (!catalog.products.length) {

    await interaction.reply({
      content:
        "❌ Belum ada product.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  const options =
    catalog.products
      .slice(0, 25)
      .map(product => ({
        label: product.name.slice(0, 100),
        value: product.id,
        description:
          "Lihat detail dan package produk"
      }));

  const menu =
    new StringSelectMenuBuilder()
      .setCustomId(
        "catalog_product_select"
      )
      .setPlaceholder(
        "Pilih product..."
      )
      .addOptions(options);

  const row =
    new ActionRowBuilder()
      .addComponents(menu);

  await interaction.reply({
    content:
      "📝 Pilih product yang ingin kamu lihat:",
    components: [row],
    flags: MessageFlags.Ephemeral
  });

  return true;
}

// ========================================
// SEND PRODUCT DESCRIPTION
// ========================================

async function sendProductDescription(
  interaction,
  productId
) {

  const product =
    catalog.products.find(
      p => p.id === productId
    );

  if (!product) {

    await interaction.reply({
      content:
        "❌ Product tidak ditemukan.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  const container =
    new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# ${product.name}\n\n` +
      `${product.description || "Belum ada deskripsi."}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );

  let packageText = "";

  if (
    product.packageA ||
    product.priceA
  ) {

    packageText +=
      `### ${product.packageA || "Package A"}\n` +
      `${product.priceA || "Harga belum diatur"}\n\n`;
  }

  if (
    product.packageB ||
    product.priceB
  ) {

    packageText +=
      `### ${product.packageB || "Package B"}\n` +
      `${product.priceB || "Harga belum diatur"}\n\n`;
  }

  if (!packageText) {

    packageText =
      "Belum ada package yang tersedia.";
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      packageText
    )
  );

  const orderButton =
    new ButtonBuilder()
      .setCustomId(
        `catalog_order_${product.id}`
      )
      .setLabel("ORDER NOW")
      .setEmoji("🛒")
      .setStyle(ButtonStyle.Primary);

  container.addActionRowComponents(
    new ActionRowBuilder()
      .addComponents(orderButton)
  );

  await interaction.reply({
    components: [container],
    flags: MessageFlags.Ephemeral |
      MessageFlags.IsComponentsV2
  });

  return true;
}

async function showProductEditor(interaction) {

  const menu = new StringSelectMenuBuilder()
    .setCustomId("catalog_edit_product_select")
    .setPlaceholder("Pilih product yang ingin diedit...")
    .addOptions(
      catalog.products.slice(0, 25).map(product => ({
        label: product.name.slice(0, 100),
        value: product.id
      }))
    );

  const row = new ActionRowBuilder()
    .addComponents(menu);

  await interaction.reply({
    content: "🛠️ Pilih product:",
    components: [row],
    flags: MessageFlags.Ephemeral
  });

  return true;
}


// ========================================
// DELETE PRODUCT
// ========================================

async function deleteProduct(
  interaction,
  productId
) {

  const index =
    catalog.products.findIndex(
      p => p.id === productId
    );

  if (index === -1) {

    await interaction.reply({
      content: "❌ Product tidak ditemukan.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  const removed =
    catalog.products.splice(index, 1)[0];

  saveCatalog();

  await interaction.reply({
    content:
      `🗑️ Product **${removed.name}** berhasil dihapus.`,
    flags: MessageFlags.Ephemeral
  });

  return true;
}


// ========================================
// ORDER PRODUCT
// ========================================

async function orderProduct(
  interaction,
  productId
) {

  const product =
    catalog.products.find(
      p => p.id === productId
    );

  if (!product) {

    await interaction.reply({
      content: "❌ Product tidak ditemukan.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  await interaction.reply({
    content:
      `🛒 **${product.name}**\n\n` +
      `Silakan hubungi staff untuk melakukan order.`,
    flags: MessageFlags.Ephemeral
  });

  return true;
}


// ========================================
// CATALOG INTERACTION
// ========================================

async function handleCatalogInteraction(
  interaction
) {

  if (
    !interaction.customId ||
    !interaction.customId.startsWith("catalog_")
  ) {
    return false;
  }

  const id = interaction.customId;


  // ----------------------------------------
  // EDIT TITLE
  // ----------------------------------------

  if (id === "catalog_edit_title") {

    const modal = new ModalBuilder()
      .setCustomId("catalog_modal_title")
      .setTitle("Edit Catalog Title");

    const input = new TextInputBuilder()
      .setCustomId("catalog_title")
      .setLabel("Catalog Title")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(catalog.title || "");

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    await interaction.showModal(modal);

    return true;
  }


  // ----------------------------------------
  // EDIT DESCRIPTION
  // ----------------------------------------

  if (id === "catalog_edit_description") {

    const modal = new ModalBuilder()
      .setCustomId("catalog_modal_description")
      .setTitle("Edit Catalog Description");

    const input = new TextInputBuilder()
      .setCustomId("catalog_description")
      .setLabel("Description")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setValue(catalog.description || "");

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    await interaction.showModal(modal);

    return true;
  }


  // ----------------------------------------
  // EDIT BUTTON
  // ----------------------------------------

  if (id === "catalog_edit_button") {

    const modal = new ModalBuilder()
      .setCustomId("catalog_modal_button")
      .setTitle("Edit Description Button");

    const input = new TextInputBuilder()
      .setCustomId("catalog_button")
      .setLabel("Button Text")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(catalog.buttonText || "");

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    await interaction.showModal(modal);

    return true;
  }


  // ----------------------------------------
  // EDIT PRODUCTS
  // ----------------------------------------

  if (id === "catalog_edit_products") {

    return await showProductEditor(
      interaction
    );
  }


  // ----------------------------------------
  // ADD PRODUCT
  // ----------------------------------------

  if (id === "catalog_add_product") {

    return await showAddProductModal(
      interaction
    );
  }


  // ----------------------------------------
  // EDIT PRODUCT
  // ----------------------------------------

  if (
    id.startsWith(
      "catalog_edit_product_"
    )
  ) {

    const productId =
      id.replace(
        "catalog_edit_product_",
        ""
      );

    return await showEditProductModal(
      interaction,
      productId
    );
  }


  // ----------------------------------------
  // DELETE PRODUCT
  // ----------------------------------------

  if (
    id.startsWith(
      "catalog_delete_product_"
    )
  ) {

    const productId =
      id.replace(
        "catalog_delete_product_",
        ""
      );

    return await deleteProduct(
      interaction,
      productId
    );
  }


  // ----------------------------------------
  // DESCRIPTION BUTTON
  // ----------------------------------------

  if (
    id === "catalog_product_description"
  ) {

    return await showProductDescription(
      interaction
    );
  }


  // ----------------------------------------
  // ORDER
  // ----------------------------------------

  if (
    id.startsWith("catalog_order_")
  ) {

    const productId =
      id.replace(
        "catalog_order_",
        ""
      );

    return await orderProduct(
      interaction,
      productId
    );
  }


  // ----------------------------------------
  // PREVIEW
  // ----------------------------------------

  if (id === "catalog_preview") {

    await interaction.reply({
      components: [buildCatalog()],
      flags:
        MessageFlags.Ephemeral |
        MessageFlags.IsComponentsV2
    });

    return true;
  }


  // ----------------------------------------
  // PUBLISH
  // ----------------------------------------

  if (id === "catalog_publish") {

    const channel =
      interaction.channel;

    if (!channel) {

      await interaction.reply({
        content:
          "❌ Channel tidak ditemukan.",
        flags: MessageFlags.Ephemeral
      });

      return true;
    }

    await channel.send({
      components: [buildCatalog()],
      flags: MessageFlags.IsComponentsV2
    });

    await interaction.reply({
      content:
        "✅ Catalog berhasil dipublish.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }


  // ----------------------------------------
  // RESET
  // ----------------------------------------

  if (id === "catalog_reset") {

    catalog = defaultCatalog();

    saveCatalog();

    await interaction.reply({
      content:
        "♻️ Catalog berhasil di-reset ke default.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }


  return false;
}


// ========================================
// HANDLE CATALOG
// ========================================

async function handleCatalog(
  interaction
) {

  if (
    interaction.isModalSubmit()
  ) {

    return await handleCatalogModals(
      interaction
    );
  }


  if (
    interaction.isStringSelectMenu()
  ) {

    if (
      interaction.customId ===
      "catalog_product_select"
    ) {

      const productId =
        interaction.values[0];

      return await sendProductDescription(
        interaction,
        productId
      );
    }


    if (
      interaction.customId ===
      "catalog_edit_product_select"
    ) {

      const productId =
        interaction.values[0];

      const row =
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(
                `catalog_edit_product_${productId}`
              )
              .setLabel("EDIT PRODUCT")
              .setEmoji("✏️")
              .setStyle(
                ButtonStyle.Primary
              ),

            new ButtonBuilder()
              .setCustomId(
                `catalog_delete_product_${productId}`
              )
              .setLabel("DELETE")
              .setEmoji("🗑️")
              .setStyle(
                ButtonStyle.Danger
              )
          );

      await interaction.reply({
        content:
          "Pilih aksi untuk product ini:",
        components: [row],
        flags: MessageFlags.Ephemeral
      });

      return true;
    }
  }


  return false;
}


// ========================================
// SETUP CATALOG COMMAND
// ========================================

async function handleCatalogCommand(
  interaction
) {

  const container =
    new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "# 🛠️ Catalog Editor\n\n" +
      "Gunakan tombol di bawah untuk mengatur catalog."
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder()
  );


  const row1 =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_title"
          )
          .setLabel("EDIT TITLE")
          .setEmoji("📝")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_description"
          )
          .setLabel("EDIT DESCRIPTION")
          .setEmoji("📄")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_button"
          )
          .setLabel("EDIT BUTTON")
          .setEmoji("🔘")
          .setStyle(
            ButtonStyle.Secondary
          )
      );


  const row2 =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_edit_products"
          )
          .setLabel("EDIT PRODUCTS")
          .setEmoji("📦")
          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_add_product"
          )
          .setLabel("ADD PRODUCT")
          .setEmoji("➕")
          .setStyle(
            ButtonStyle.Success
          )
      );


  const row3 =
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
          .setCustomId(
            "catalog_preview"
          )
          .setLabel("PREVIEW")
          .setEmoji("👁️")
          .setStyle(
            ButtonStyle.Secondary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_publish"
          )
          .setLabel("PUBLISH")
          .setEmoji("📢")
          .setStyle(
            ButtonStyle.Primary
          ),

        new ButtonBuilder()
          .setCustomId(
            "catalog_reset"
          )
          .setLabel("RESET")
          .setEmoji("♻️")
          .setStyle(
            ButtonStyle.Danger
          )
      );


  container.addActionRowComponents(row1);
  container.addActionRowComponents(row2);
  container.addActionRowComponents(row3);


  await interaction.reply({
    components: [container],
    flags:
      MessageFlags.Ephemeral |
      MessageFlags.IsComponentsV2
  });

  return true;
}


// ========================================
// SET SLOT
// ========================================

async function handleSetSlot(
  interaction
) {

  if (
    interaction.commandName !== "setslot"
  ) {
    return false;
  }

  const product =
    interaction.options.getString(
      "product"
    );

  const slot =
    interaction.options.getInteger(
      "slot"
    );

  const target =
    catalog.products.find(
      p => p.id === product
    );

  if (!target) {

    await interaction.reply({
      content:
        "❌ Product tidak ditemukan.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  target.slot = slot;

  saveCatalog();

  await interaction.reply({
    content:
      `✅ Slot product **${target.name}** diubah menjadi **${slot}**.`,
    flags: MessageFlags.Ephemeral
  });

  return true;
}


// ========================================
// ADD SLOT
// ========================================

async function handleAddSlot(
  interaction
) {

  if (
    interaction.commandName !== "addslot"
  ) {
    return false;
  }

  const product =
    interaction.options.getString(
      "product"
    );

  const target =
    catalog.products.find(
      p => p.id === product
    );

  if (!target) {

    await interaction.reply({
      content:
        "❌ Product tidak ditemukan.",
      flags: MessageFlags.Ephemeral
    });

    return true;
  }

  target.slot =
    (target.slot || 0) + 1;

  saveCatalog();

  await interaction.reply({
    content:
      `✅ Slot **${target.name}** sekarang: **${target.slot}**.`,
    flags: MessageFlags.Ephemeral
  });

  return true;
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
    return false;
  }

  if (
    interaction.commandName !== "setslot" &&
    interaction.commandName !== "addslot"
  ) {
    return false;
  }

  const focused =
    interaction.options.getFocused()
      .toLowerCase();

  const results =
    catalog.products
      .filter(product =>
        product.name
          .toLowerCase()
          .includes(focused)
      )
      .slice(0, 25)
      .map(product => ({
        name: product.name,
        value: product.id
      }));

  await interaction.respond(
    results
  );

  return true;
}


// ========================================
// COMMANDS
// ========================================

const catalogCommand =
  new SlashCommandBuilder()
    .setName("setup-catalog")
    .setDescription(
      "Open catalog editor"
    );


const setSlotCommand =
  new SlashCommandBuilder()
    .setName("setslot")
    .setDescription(
      "Set product slot"
    )
    .addStringOption(option =>
      option
        .setName("product")
        .setDescription(
          "Product"
        )
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(option =>
      option
        .setName("slot")
        .setDescription(
          "Jumlah slot"
        )
        .setRequired(true)
    );


const addSlotCommand =
  new SlashCommandBuilder()
    .setName("addslot")
    .setDescription(
      "Tambah product slot"
    )
    .addStringOption(option =>
      option
        .setName("product")
        .setDescription(
          "Product"
        )
        .setRequired(true)
        .setAutocomplete(true)
    );


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