const fs = require("fs");
const path = require("path");

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require("discord.js");

const {
  TICKET_PANEL_CHANNEL_ID,
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID,
  ORDER_CATEGORY_NAME
} = require("../config");

// ======================================================
// FILE CONFIG
// ======================================================

const PANEL_FILE = path.join(
  __dirname,
  "ticket-panel.json"
);

// ======================================================
// DEFAULT PANEL
// ======================================================

const DEFAULT_CONFIG = {
  text:
    "## 🟧 MONROE COMMUNITY\n\n" +
    "### SUPPORT CENTER\n\n" +
    "Need help or want to order something?\n" +
    "Choose the button below to create a private ticket.",

  banner: "",

  footer:
    "MONROE COMMUNITY © 2026"
};

// ======================================================
// LOAD CONFIG
// ======================================================

function loadConfig() {
  try {

    if (
      !fs.existsSync(
        PANEL_FILE
      )
    ) {

      fs.writeFileSync(
        PANEL_FILE,

        JSON.stringify(
          DEFAULT_CONFIG,
          null,
          2
        )
      );

      return {
        ...DEFAULT_CONFIG
      };
    }

    const raw =
      fs.readFileSync(
        PANEL_FILE,
        "utf8"
      );

    const data =
      JSON.parse(raw);

    return {
      ...DEFAULT_CONFIG,
      ...data
    };

  } catch (error) {

    console.error(
      "❌ Gagal membaca ticket-panel.json:",
      error
    );

    return {
      ...DEFAULT_CONFIG
    };
  }
}

// ======================================================
// SAVE CONFIG
// ======================================================

function saveConfig(data) {
  try {

    fs.writeFileSync(
      PANEL_FILE,

      JSON.stringify(
        data,
        null,
        2
      )
    );

    return true;

  } catch (error) {

    console.error(
      "❌ Gagal menyimpan ticket-panel.json:",
      error
    );

    return false;
  }
}

// ======================================================
// SLASH COMMAND
// ======================================================

const ticketCommand =
  new SlashCommandBuilder()
    .setName(
      "setup-ticket"
    )
    .setDescription(
      "Open the Monroe ticket panel editor."
    );

// ======================================================
// EDITOR BUTTONS
// ======================================================

function createEditorComponents() {

  const editText =
    new ButtonBuilder()
      .setCustomId(
        "ticket_editor_text"
      )
      .setLabel(
        "EDIT TEXT"
      )
      .setStyle(
        ButtonStyle.Secondary
      );

  const editBanner =
    new ButtonBuilder()
      .setCustomId(
        "ticket_editor_banner"
      )
      .setLabel(
        "EDIT BANNER"
      )
      .setStyle(
        ButtonStyle.Secondary
      );

  const editFooter =
    new ButtonBuilder()
      .setCustomId(
        "ticket_editor_footer"
      )
      .setLabel(
        "EDIT FOOTER"
      )
      .setStyle(
        ButtonStyle.Secondary
      );

  const preview =
    new ButtonBuilder()
      .setCustomId(
        "ticket_editor_preview"
      )
      .setLabel(
        "PREVIEW"
      )
      .setStyle(
        ButtonStyle.Primary
      );

  const save =
    new ButtonBuilder()
      .setCustomId(
        "ticket_editor_save"
      )
      .setLabel(
        "SAVE & PUBLISH"
      )
      .setStyle(
        ButtonStyle.Success
      );

  const reset =
    new ButtonBuilder()
      .setCustomId(
        "ticket_editor_reset"
      )
      .setLabel(
        "RESET"
      )
      .setStyle(
        ButtonStyle.Danger
      );

  return [

    new ActionRowBuilder()
      .addComponents(
        editText,
        editBanner,
        editFooter
      ),

    new ActionRowBuilder()
      .addComponents(
        preview,
        save,
        reset
      )

  ];
}

// ======================================================
// EDITOR CONTAINER
// ======================================================

function createEditorContainer() {

  const config =
    loadConfig();

  const text =
    new TextDisplayBuilder()
      .setContent(

        "## 🟧 TICKET PANEL EDITOR\n\n" +

        "Atur isi Ticket Panel langsung " +
        "dari Discord.\n\n" +

        "**TEXT**\n" +

        "```" +
        (
          config.text ||
          "(kosong)"
        ) +
        "```\n\n" +

        "**BANNER**\n" +

        (
          config.banner ||
          "`Tidak ada banner`"
        ) +

        "\n\n" +

        "**FOOTER**\n" +

        (
          config.footer ||
          "`Tidak ada footer`"
        ) +

        "\n\n" +

        "Gunakan tombol di bawah untuk " +
        "mengedit panel."

      );

  const container =
    new ContainerBuilder()
      .addTextDisplayComponents(
        text
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
      );

  return container;
}

// ======================================================
// TICKET PANEL
// ======================================================

function createTicketPanelComponents() {

  const config =
    loadConfig();

  const container =
    new ContainerBuilder();

  // ----------------------------------------------------
  // TEXT
  // ----------------------------------------------------

  container.addTextDisplayComponents(

    new TextDisplayBuilder()
      .setContent(
        config.text ||
        DEFAULT_CONFIG.text
      )

  );

  // ----------------------------------------------------
  // BANNER
  // ----------------------------------------------------

  if (
    config.banner &&
    /^https?:\/\//i.test(
      config.banner
    )
  ) {

    const gallery =
      new MediaGalleryBuilder()
        .addItems(

          new MediaGalleryItemBuilder()
            .setURL(
              config.banner
            )

        );

    container
      .addSeparatorComponents(
        new SeparatorBuilder()
      )
      .addMediaGalleryComponents(
        gallery
      );
  }

  // ----------------------------------------------------
  // FOOTER
  // ----------------------------------------------------

  if (
    config.footer
  ) {

    container
      .addSeparatorComponents(
        new SeparatorBuilder()
      )
      .addTextDisplayComponents(

        new TextDisplayBuilder()
          .setContent(
            config.footer
          )

      );
  }

  // ----------------------------------------------------
  // BUTTONS
  // ----------------------------------------------------

  const orderButton =
    new ButtonBuilder()
      .setCustomId(
        "ticket_buy"
      )
      .setLabel(
        "ORDER"
      )
      .setStyle(
        ButtonStyle.Primary
      );

  const staffButton =
    new ButtonBuilder()
      .setCustomId(
        "ticket_staff"
      )
      .setLabel(
        "CONTACT STAFF"
      )
      .setStyle(
        ButtonStyle.Secondary
      );

  const warrantyButton =
    new ButtonBuilder()
      .setCustomId(
        "ticket_warranty"
      )
      .setLabel(
        "WARRANTY"
      )
      .setStyle(
        ButtonStyle.Secondary
      );

  const buttons =
    new ActionRowBuilder()
      .addComponents(
        orderButton,
        staffButton,
        warrantyButton
      );

  return [
    container,
    buttons
  ];
}

// ======================================================
// SEND TICKET PANEL
// ======================================================

async function sendTicketPanel(
  client
) {

  try {

    if (
      !TICKET_PANEL_CHANNEL_ID
    ) {

      console.error(
        "❌ TICKET_PANEL_CHANNEL_ID belum diatur."
      );

      return;
    }

    const channel =
      await client.channels.fetch(
        TICKET_PANEL_CHANNEL_ID
      );

    if (!channel) {

      console.error(
        "❌ Ticket panel channel tidak ditemukan."
      );

      return;
    }

    if (
      !channel.isTextBased()
    ) {

      console.error(
        "❌ Ticket panel channel bukan text channel."
      );

      return;
    }

    const components =
      createTicketPanelComponents();

    // --------------------------------------------------
    // CARI PANEL LAMA
    // --------------------------------------------------

    const messages =
      await channel.messages.fetch({
        limit: 50
      });

    const oldPanel =
      messages.find(
        message =>

          message.author.id ===
            client.user.id &&

          message.components?.length > 0

      );

    // --------------------------------------------------
    // UPDATE PANEL LAMA
    // --------------------------------------------------

    if (
      oldPanel
    ) {

      await oldPanel.edit({

        components,

        flags:
          MessageFlags.IsComponentsV2

      });

      console.log(
        "✅ Ticket Panel berhasil di-update."
      );

      return oldPanel;
    }

    // --------------------------------------------------
    // KIRIM PANEL BARU
    // --------------------------------------------------

    const sent =
      await channel.send({

        components,

        flags:
          MessageFlags.IsComponentsV2

      });

    console.log(
      "✅ Ticket Panel berhasil dikirim."
    );

    return sent;

  } catch (error) {

    console.error(
      "❌ Error sendTicketPanel:",
      error
    );

    throw error;
  }
}

// ======================================================
// TEXT MODAL
// ======================================================

function createTextModal() {

  const config =
    loadConfig();

  const input =
    new TextInputBuilder()
      .setCustomId(
        "ticket_text_input"
      )
      .setLabel(
        "Ticket Panel Text"
      )
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(
        true
      )
      .setMaxLength(
        4000
      )
      .setValue(
        config.text ||
        DEFAULT_CONFIG.text
      );

  return new ModalBuilder()
    .setCustomId(
      "ticket_text_modal"
    )
    .setTitle(
      "Edit Ticket Text"
    )
    .addComponents(

      new ActionRowBuilder()
        .addComponents(
          input
        )

    );
}

// ======================================================
// BANNER MODAL
// ======================================================

function createBannerModal() {

  const config =
    loadConfig();

  const input =
    new TextInputBuilder()
      .setCustomId(
        "ticket_banner_input"
      )
      .setLabel(
        "Banner Image URL"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(
        false
      )
      .setPlaceholder(
        "https://example.com/banner.png"
      )
      .setValue(
        config.banner ||
        ""
      );

  return new ModalBuilder()
    .setCustomId(
      "ticket_banner_modal"
    )
    .setTitle(
      "Edit Ticket Banner"
    )
    .addComponents(

      new ActionRowBuilder()
        .addComponents(
          input
        )

    );
}

// ======================================================
// FOOTER MODAL
// ======================================================

function createFooterModal() {

  const config =
    loadConfig();

  const input =
    new TextInputBuilder()
      .setCustomId(
        "ticket_footer_input"
      )
      .setLabel(
        "Footer Text"
      )
      .setStyle(
        TextInputStyle.Short
      )
      .setRequired(
        false
      )
      .setMaxLength(
        1000
      )
      .setValue(
        config.footer ||
        ""
      );

  return new ModalBuilder()
    .setCustomId(
      "ticket_footer_modal"
    )
    .setTitle(
      "Edit Ticket Footer"
    )
    .addComponents(

      new ActionRowBuilder()
        .addComponents(
          input
        )

    );
}

// ======================================================
// PREVIEW
// ======================================================

async function showTicketPreview(
  interaction
) {

  const components =
    createTicketPanelComponents();

  await interaction.reply({

    components,

    flags:
      MessageFlags.IsComponentsV2 |
      MessageFlags.Ephemeral

  });
}

// ======================================================
// RESET
// ======================================================

async function resetTicketConfig(
  interaction
) {

  saveConfig({
    ...DEFAULT_CONFIG
  });

  await interaction.reply({

    content:
      "♻️ Ticket Panel berhasil di-reset ke default.",

    ephemeral: true

  });
}

// ======================================================
// PERMISSION CHECK
// ======================================================

function isStaff(
  member
) {

  if (!member) {
    return false;
  }

  if (
    member.permissions?.has(
      PermissionFlagsBits.Administrator
    )
  ) {
    return true;
  }

  if (
    STAFF_ROLE_ID &&
    member.roles?.cache?.has(
      STAFF_ROLE_ID
    )
  ) {
    return true;
  }

  if (
    FOUNDER_ROLE_ID &&
    member.roles?.cache?.has(
      FOUNDER_ROLE_ID
    )
  ) {
    return true;
  }

  return false;
}

// ======================================================
// END OF PART 1
// ======================================================

// ======================================================
// CATEGORY
// ======================================================

async function getTicketCategory(
  guild
) {

  let category =
    guild.channels.cache.find(
      channel =>

        channel.type ===
          ChannelType.GuildCategory &&

        channel.name ===
          (
            ORDER_CATEGORY_NAME ||
            "🛒・MONROE ORDERS"
          )
    );

  if (category) {
    return category;
  }

  category =
    await guild.channels.create({

      name:
        ORDER_CATEGORY_NAME ||
        "🛒・MONROE ORDERS",

      type:
        ChannelType.GuildCategory

    });

  return category;
}

// ======================================================
// FIND EXISTING TICKET
// ======================================================

function findExistingTicket(
  guild,
  userId
) {

  return guild.channels.cache.find(

    channel =>

      channel.type ===
        ChannelType.GuildText &&

      channel.topic ===
        `ticket-owner:${userId}`

  );
}

// ======================================================
// CREATE TICKET
// ======================================================

async function createTicket(
  interaction,
  type
) {

  const guild =
    interaction.guild;

  const user =
    interaction.user;

  if (!guild) {
    return;
  }

  // ----------------------------------------------------
  // CHECK EXISTING TICKET
  // ----------------------------------------------------

  const existing =
    findExistingTicket(
      guild,
      user.id
    );

  if (existing) {

    return interaction.reply({

      content:
        `❌ Kamu sudah memiliki ticket: ${existing}`,

      ephemeral: true

    });
  }

  // ----------------------------------------------------
  // GET CATEGORY
  // ----------------------------------------------------

  const category =
    await getTicketCategory(
      guild
    );

  // ----------------------------------------------------
  // TICKET PREFIX
  // ----------------------------------------------------

  let prefix =
    "order";

  if (
    type === "staff"
  ) {
    prefix =
      "staff";
  }

  if (
    type === "warranty"
  ) {
    prefix =
      "warranty";
  }

  // ----------------------------------------------------
  // SAFE USERNAME
  // ----------------------------------------------------

  const safeName =
    user.username
      .toLowerCase()
      .replace(
        /[^a-z0-9-_]/g,
        "-"
      )
      .slice(
        0,
        20
      );

  const channelName =
    `${prefix}-${safeName}`;

  // ----------------------------------------------------
  // PERMISSIONS
  // ----------------------------------------------------

  const permissionOverwrites = [

    {
      id:
        guild.roles.everyone.id,

      deny: [

        PermissionFlagsBits.ViewChannel

      ]
    },

    {
      id:
        user.id,

      allow: [

        PermissionFlagsBits.ViewChannel,

        PermissionFlagsBits.SendMessages,

        PermissionFlagsBits.ReadMessageHistory,

        PermissionFlagsBits.AttachFiles,

        PermissionFlagsBits.EmbedLinks

      ]
    }

  ];

  // ----------------------------------------------------
  // STAFF ROLE
  // ----------------------------------------------------

  if (
    STAFF_ROLE_ID
  ) {

    permissionOverwrites.push({

      id:
        STAFF_ROLE_ID,

      allow: [

        PermissionFlagsBits.ViewChannel,

        PermissionFlagsBits.SendMessages,

        PermissionFlagsBits.ReadMessageHistory,

        PermissionFlagsBits.AttachFiles,

        PermissionFlagsBits.EmbedLinks

      ]

    });
  }

  // ----------------------------------------------------
  // FOUNDER ROLE
  // ----------------------------------------------------

  if (
    FOUNDER_ROLE_ID
  ) {

    permissionOverwrites.push({

      id:
        FOUNDER_ROLE_ID,

      allow: [

        PermissionFlagsBits.ViewChannel,

        PermissionFlagsBits.SendMessages,

        PermissionFlagsBits.ReadMessageHistory,

        PermissionFlagsBits.AttachFiles,

        PermissionFlagsBits.EmbedLinks

      ]

    });
  }

  // ----------------------------------------------------
  // BOT
  // ----------------------------------------------------

  permissionOverwrites.push({

    id:
      interaction.client.user.id,

    allow: [

      PermissionFlagsBits.ViewChannel,

      PermissionFlagsBits.SendMessages,

      PermissionFlagsBits.ReadMessageHistory,

      PermissionFlagsBits.ManageChannels,

      PermissionFlagsBits.ManageMessages

    ]

  });

  // ----------------------------------------------------
  // CREATE CHANNEL
  // ----------------------------------------------------

  const ticketChannel =
    await guild.channels.create({

      name:
        channelName,

      type:
        ChannelType.GuildText,

      parent:
        category.id,

      topic:
        `ticket-owner:${user.id}`,

      permissionOverwrites

    });

  // ====================================================
  // CLOSE BUTTON
  // ====================================================

  const closeButton =
    new ButtonBuilder()

      .setCustomId(
        "ticket_close"
      )

      .setLabel(
        "CLOSE TICKET"
      )

      .setStyle(
        ButtonStyle.Danger
      );

  const closeRow =
    new ActionRowBuilder()
      .addComponents(
        closeButton
      );

  // ====================================================
  // TICKET TYPE
  // ====================================================

  let typeName =
    "ORDER";

  if (
    type === "staff"
  ) {
    typeName =
      "CONTACT STAFF";
  }

  if (
    type === "warranty"
  ) {
    typeName =
      "WARRANTY";
  }

  // ====================================================
  // TICKET MESSAGE
  // ====================================================

  const ticketText =
    new TextDisplayBuilder()
      .setContent(

        `## 🟧 MONROE COMMUNITY\n\n` +

        `### ${typeName}\n\n` +

        `**Customer:** ${user}\n` +

        `**Ticket:** <#${ticketChannel.id}>\n\n` +

        `Ticket ini bersifat private.\n` +

        `Staff dan founder dapat membantu kamu di sini.\n\n` +

        `Silakan jelaskan kebutuhan kamu dengan jelas.`

      );

  const ticketContainer =
    new ContainerBuilder()
      .addTextDisplayComponents(
        ticketText
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
      );

  // ====================================================
  // SEND TICKET MESSAGE
  // ====================================================

  await ticketChannel.send({

    components: [

      ticketContainer,

      closeRow

    ],

    flags:
      MessageFlags.IsComponentsV2

  });

  // ====================================================
  // USER RESPONSE
  // ====================================================

  await interaction.reply({

    content:
      `✅ Ticket berhasil dibuat: ${ticketChannel}`,

    ephemeral: true

  });
}

// ======================================================
// CLOSE TICKET
// ======================================================

async function closeTicket(
  interaction
) {

  const channel =
    interaction.channel;

  if (!channel) {
    return;
  }

  if (
    !channel.topic?.startsWith(
      "ticket-owner:"
    )
  ) {

    return interaction.reply({

      content:
        "❌ Ini bukan ticket Monroe.",

      ephemeral: true

    });
  }

  // ----------------------------------------------------
  // STAFF / FOUNDER
  // ----------------------------------------------------

  if (
    !isStaff(
      interaction.member
    )
  ) {

    const ownerId =
      channel.topic.replace(
        "ticket-owner:",
        ""
      );

    if (
      interaction.user.id !==
      ownerId
    ) {

      return interaction.reply({

        content:
          "❌ Kamu tidak memiliki izin untuk menutup ticket ini.",

        ephemeral: true

      });
    }
  }

  // ----------------------------------------------------
  // DELETE
  // ----------------------------------------------------

  await interaction.reply({

    content:
      "🔒 Ticket akan ditutup dalam 5 detik..."

  });

  setTimeout(

    async () => {

      await channel
        .delete()
        .catch(
          () => {}
        );

    },

    5000

  );
}

// ======================================================
// HANDLE TICKET FEATURE
// ======================================================

async function handleTicketFeature(
  interaction
) {

  // ====================================================
  // SETUP TICKET
  // ====================================================

  if (

    interaction.isChatInputCommand() &&

    interaction.commandName ===
      "setup-ticket"

  ) {

    if (
      !isStaff(
        interaction.member
      )
    ) {

      return interaction.reply({

        content:
          "❌ Kamu tidak memiliki izin menggunakan command ini.",

        ephemeral: true

      });
    }

    const container =
      createEditorContainer();

    return interaction.reply({

      components: [

        container,

        ...createEditorComponents()

      ],

      flags:
        MessageFlags.IsComponentsV2 |
        MessageFlags.Ephemeral

    });
  }

  // ====================================================
  // BUTTON INTERACTIONS
  // ====================================================

  if (
    interaction.isButton()
  ) {

    // --------------------------------------------------
    // EDIT TEXT
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_editor_text"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      return interaction.showModal(
        createTextModal()
      );
    }

    // --------------------------------------------------
    // EDIT BANNER
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_editor_banner"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      return interaction.showModal(
        createBannerModal()
      );
    }

    // --------------------------------------------------
    // EDIT FOOTER
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_editor_footer"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      return interaction.showModal(
        createFooterModal()
      );
    }

    // --------------------------------------------------
    // PREVIEW
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_editor_preview"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      return showTicketPreview(
        interaction
      );
    }

    // --------------------------------------------------
    // RESET
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_editor_reset"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      return resetTicketConfig(
        interaction
      );
    }

    // --------------------------------------------------
    // SAVE & PUBLISH
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_editor_save"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      await interaction.deferReply({

        ephemeral: true

      });

      try {

        await sendTicketPanel(
          interaction.client
        );

        return interaction.editReply({

          content:
            "✅ Ticket Panel berhasil disimpan dan dipublish."

        });

      } catch (error) {

        console.error(
          "❌ Publish Ticket Panel:",
          error
        );

        return interaction.editReply({

          content:
            "❌ Gagal mempublish Ticket Panel."

        });
      }
    }

    // --------------------------------------------------
    // ORDER
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_buy"
    ) {

      return createTicket(
        interaction,
        "order"
      );
    }

    // --------------------------------------------------
    // CONTACT STAFF
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_staff"
    ) {

      return createTicket(
        interaction,
        "staff"
      );
    }

    // --------------------------------------------------
    // WARRANTY
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_warranty"
    ) {

      return createTicket(
        interaction,
        "warranty"
      );
    }

    // --------------------------------------------------
    // CLOSE TICKET
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_close"
    ) {

      return closeTicket(
        interaction
      );
    }
  }

  // ====================================================
  // MODAL SUBMISSIONS
  // ====================================================

  if (
    interaction.isModalSubmit()
  ) {

    // --------------------------------------------------
    // TEXT
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_text_modal"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      const text =
        interaction.fields
          .getTextInputValue(
            "ticket_text_input"
          );

      const config =
        loadConfig();

      config.text =
        text.trim();

      saveConfig(
        config
      );

      return interaction.reply({

        content:
          "✅ Text Ticket Panel berhasil disimpan.\n\nGunakan **PREVIEW** untuk melihat hasilnya.",

        ephemeral: true

      });
    }

    // --------------------------------------------------
    // BANNER
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_banner_modal"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      const banner =
        interaction.fields
          .getTextInputValue(
            "ticket_banner_input"
          )
          .trim();

      if (
        banner &&
        !/^https?:\/\//i.test(
          banner
        )
      ) {

        return interaction.reply({

          content:
            "❌ URL banner harus dimulai dengan `http://` atau `https://`.",

          ephemeral: true

        });
      }

      const config =
        loadConfig();

      config.banner =
        banner;

      saveConfig(
        config
      );

      return interaction.reply({

        content:
          banner
            ? "✅ Banner berhasil disimpan."
            : "✅ Banner berhasil dihapus.",

        ephemeral: true

      });
    }

    // --------------------------------------------------
    // FOOTER
    // --------------------------------------------------

    if (
      interaction.customId ===
        "ticket_footer_modal"
    ) {

      if (
        !isStaff(
          interaction.member
        )
      ) {

        return interaction.reply({

          content:
            "❌ Kamu tidak memiliki izin.",

          ephemeral: true

        });
      }

      const footer =
        interaction.fields
          .getTextInputValue(
            "ticket_footer_input"
          )
          .trim();

      const config =
        loadConfig();

      config.footer =
        footer;

      saveConfig(
        config
      );

      return interaction.reply({

        content:
          footer
            ? "✅ Footer berhasil disimpan."
            : "✅ Footer berhasil dihapus.",

        ephemeral: true

      });
    }
  }

  return false;
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {

  ticketCommand,

  sendTicketPanel,

  handleTicketFeature

};