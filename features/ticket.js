const fs = require("fs");
const path = require("path");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ContainerBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const {
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID,
  ORDER_CATEGORY_NAME,
  TICKET_PANEL_CHANNEL_ID
} = require("../config");

// =====================================================
// MONROE LOGO
// =====================================================

const MONROE_LOGO =
  "https://cdn.discordapp.com/attachments/1528188606663884853/1555836549474689105/Tak_berjudul41_20260920220611.jpg?backend=b2&ex=6ac1f933&is=6ac0a7b3&hm=248717fd85b4ec8cbba608f95fc6e079bffd0e3a8405ec267f860fe571da253a&";

// =====================================================
// DATA
// =====================================================

const DATA_DIR = path.join(__dirname, "..", "data");
const PANEL_FILE = path.join(DATA_DIR, "ticket-panel.json");

const DEFAULT_PANEL = {
  text: "",
  banner: "",
  footer: ""
};

// =====================================================
// DATA FILE
// =====================================================

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, {
        recursive: true
      });
    }

    if (!fs.existsSync(PANEL_FILE)) {
      fs.writeFileSync(
        PANEL_FILE,
        JSON.stringify(DEFAULT_PANEL, null, 2),
        "utf8"
      );
    }
  } catch (error) {
    console.error(
      "❌ Gagal membuat ticket-panel.json:",
      error
    );
  }
}

// =====================================================
// LOAD PANEL
// =====================================================

function loadPanel() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(
      PANEL_FILE,
      "utf8"
    );

    const data = JSON.parse(raw);

    return {
      text:
        typeof data.text === "string"
          ? data.text
          : "",

      banner:
        typeof data.banner === "string"
          ? data.banner
          : "",

      footer:
        typeof data.footer === "string"
          ? data.footer
          : ""
    };
  } catch (error) {
    console.error(
      "❌ Gagal membaca ticket-panel.json:",
      error
    );

    return {
      ...DEFAULT_PANEL
    };
  }
}

// =====================================================
// SAVE PANEL
// =====================================================

function savePanel(data) {
  ensureDataFile();

  const cleanData = {
    text:
      typeof data.text === "string"
        ? data.text
        : "",

    banner:
      typeof data.banner === "string"
        ? data.banner
        : "",

    footer:
      typeof data.footer === "string"
        ? data.footer
        : ""
  };

  fs.writeFileSync(
    PANEL_FILE,
    JSON.stringify(cleanData, null, 2),
    "utf8"
  );

  return cleanData;
}

// =====================================================
// RESET PANEL
// =====================================================

function resetPanel() {
  return savePanel({
    ...DEFAULT_PANEL
  });
}

// =====================================================
// STAFF CHECK
// =====================================================

function isStaff(member) {
  if (!member || !member.roles) {
    return false;
  }

  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID)
  );
}

// =====================================================
// TICKET BUTTONS
// =====================================================

function createTicketButtons() {
  const orderButton = new ButtonBuilder()
    .setCustomId("ticket_buy")
    .setLabel("ORDER")
    .setEmoji("🛒")
    .setStyle(ButtonStyle.Primary);

  const staffButton = new ButtonBuilder()
    .setCustomId("ticket_staff")
    .setLabel("CONTACT STAFF")
    .setEmoji("💬")
    .setStyle(ButtonStyle.Secondary);

  const warrantyButton = new ButtonBuilder()
    .setCustomId("ticket_warranty")
    .setLabel("WARRANTY")
    .setEmoji("🛡️")
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder().addComponents(
    orderButton,
    staffButton,
    warrantyButton
  );
}

// =====================================================
// BUILD PANEL
// =====================================================

function buildTicketPanel({
  includeButtons = true
} = {}) {
  const panel = loadPanel();

  const container = new ContainerBuilder()
    .setAccentColor(0xff8c00);

  if (panel.text.trim()) {
    container.addTextDisplayComponents(
      text =>
        text.setContent(panel.text)
    );
  }

  if (panel.banner.trim()) {
    container.addMediaGalleryComponents(
      gallery =>
        gallery.addItems(
          new MediaGalleryItemBuilder()
            .setURL(panel.banner.trim())
        )
    );
  }

  if (panel.footer.trim()) {
    container.addTextDisplayComponents(
      text =>
        text.setContent(panel.footer)
    );
  }

  if (includeButtons) {
    container.addActionRowComponents(
      createTicketButtons()
    );
  }

  return container;
}

// =====================================================
// EDITOR PREVIEW
// =====================================================

function buildEditorPreview() {
  const panel = loadPanel();

  const container = new ContainerBuilder()
    .setAccentColor(0xff8c00)

    .addTextDisplayComponents(
      text =>
        text.setContent(
          "## 🛠️ TICKET PANEL EDITOR\n\n" +
          "Atur tampilan Ticket Panel kamu dari sini.\n\n" +

          "**TEXT**\n" +
          `${panel.text.trim() || "-# Belum diatur"}\n\n` +

          "**BANNER**\n" +
          `${panel.banner.trim() || "-# Belum diatur"}\n\n` +

          "**FOOTER**\n" +
          `${panel.footer.trim() || "-# Belum diatur"}`
        )
    )

    .addActionRowComponents(
      new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("ticket_editor_text")
          .setLabel("EDIT TEXT")
          .setEmoji("📝")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("ticket_editor_banner")
          .setLabel("EDIT BANNER")
          .setEmoji("🖼️")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("ticket_editor_footer")
          .setLabel("EDIT FOOTER")
          .setEmoji("📌")
          .setStyle(ButtonStyle.Secondary)
      )
    )

    .addActionRowComponents(
      new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("ticket_editor_preview")
          .setLabel("PREVIEW")
          .setEmoji("👁️")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("ticket_editor_save")
          .setLabel("SAVE & PUBLISH")
          .setEmoji("💾")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("ticket_editor_reset")
          .setLabel("RESET")
          .setEmoji("🗑️")
          .setStyle(ButtonStyle.Danger)
      )
    );

  return container;
}

// =====================================================
// SHOW EDITOR
// =====================================================

async function showEditor(interaction) {
  const container = buildEditorPreview();

  return interaction.reply({
    components: [container],
    flags:
      MessageFlags.IsComponentsV2 |
      MessageFlags.Ephemeral
  });
}

// =====================================================
// TEXT MODAL
// =====================================================

async function showTextModal(interaction) {
  const panel = loadPanel();

  const input = new TextInputBuilder()
    .setCustomId("ticket_text_input")
    .setLabel("Ticket Panel Text")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(
      "Tulis isi Ticket Panel di sini..."
    )
    .setRequired(false)
    .setMaxLength(4000);

  if (panel.text) {
    input.setValue(
      panel.text.slice(0, 4000)
    );
  }

  const modal = new ModalBuilder()
    .setCustomId(
      "ticket_editor_text_modal"
    )
    .setTitle("Edit Ticket Text")
    .addComponents(
      new ActionRowBuilder().addComponents(
        input
      )
    );

  return interaction.showModal(modal);
}

// =====================================================
// BANNER MODAL
// =====================================================

async function showBannerModal(interaction) {
  const panel = loadPanel();

  const input = new TextInputBuilder()
    .setCustomId("ticket_banner_input")
    .setLabel("Banner URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(
      "https://cdn.discordapp.com/..."
    )
    .setRequired(false)
    .setMaxLength(1000);

  if (panel.banner) {
    input.setValue(
      panel.banner.slice(0, 1000)
    );
  }

  const modal = new ModalBuilder()
    .setCustomId(
      "ticket_editor_banner_modal"
    )
    .setTitle("Edit Ticket Banner")
    .addComponents(
      new ActionRowBuilder().addComponents(
        input
      )
    );

  return interaction.showModal(modal);
}

// =====================================================
// FOOTER MODAL
// =====================================================

async function showFooterModal(interaction) {
  const panel = loadPanel();

  const input = new TextInputBuilder()
    .setCustomId("ticket_footer_input")
    .setLabel("Footer Text")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(
      "-# MONROE COMMUNITY © 2026"
    )
    .setRequired(false)
    .setMaxLength(2000);

  if (panel.footer) {
    input.setValue(
      panel.footer.slice(0, 2000)
    );
  }

  const modal = new ModalBuilder()
    .setCustomId(
      "ticket_editor_footer_modal"
    )
    .setTitle("Edit Ticket Footer")
    .addComponents(
      new ActionRowBuilder().addComponents(
        input
      )
    );

  return interaction.showModal(modal);
}

// =====================================================
// SEND TICKET PANEL
// =====================================================

async function sendTicketPanel(client) {
  try {
    const channel =
      await client.channels.fetch(
        TICKET_PANEL_CHANNEL_ID
      );

    if (
      !channel ||
      !channel.isTextBased()
    ) {
      console.error(
        "❌ Ticket Panel Channel tidak ditemukan."
      );

      return;
    }

    const messages =
      await channel.messages.fetch({
        limit: 50
      });

    const alreadyExists =
      messages.some(
        message =>
          message.author.id ===
            client.user.id &&
          message.flags.has(
            MessageFlags.IsComponentsV2
          )
      );

    if (alreadyExists) {
      return;
    }

    const panel = loadPanel();

    if (
      !panel.text.trim() &&
      !panel.banner.trim() &&
      !panel.footer.trim()
    ) {
      console.log(
        "⚠️ Ticket Panel kosong. Gunakan /setup-ticket."
      );

      return;
    }

    const container =
      buildTicketPanel({
        includeButtons: true
      });

    await channel.send({
      components: [container],
      flags:
        MessageFlags.IsComponentsV2
    });

    console.log(
      "✅ Panel Ticket Components V2 berhasil dikirim."
    );

  } catch (error) {
    console.error(
      "❌ Gagal mengirim Ticket Panel:",
      error
    );
  }
}

// =====================================================
// PUBLISH PANEL
// =====================================================

async function publishTicketPanel(
  interaction
) {
  try {
    const channel =
      await interaction.client.channels.fetch(
        TICKET_PANEL_CHANNEL_ID
      );

    if (
      !channel ||
      !channel.isTextBased()
    ) {
      return interaction.reply({
        content:
          "❌ Channel Ticket Panel tidak ditemukan.",
        ephemeral: true
      });
    }

    const panel = loadPanel();

    if (
      !panel.text.trim() &&
      !panel.banner.trim() &&
      !panel.footer.trim()
    ) {
      return interaction.reply({
        content:
          "❌ Panel masih kosong. Isi minimal TEXT, BANNER, atau FOOTER.",
        ephemeral: true
      });
    }

    const messages =
      await channel.messages.fetch({
        limit: 50
      });

    const oldPanels =
      messages.filter(
        message =>
          message.author.id ===
            interaction.client.user.id &&
          message.flags.has(
            MessageFlags.IsComponentsV2
          )
      );

    for (
      const message of oldPanels.values()
    ) {
      try {
        await message.delete();
      } catch {}
    }

    const container =
      buildTicketPanel({
        includeButtons: true
      });

    await channel.send({
      components: [container],
      flags:
        MessageFlags.IsComponentsV2
    });

    return interaction.reply({
      content:
        "✅ Ticket Panel berhasil disimpan dan dipublish.",
      ephemeral: true
    });

  } catch (error) {
    console.error(
      "❌ Gagal publish Ticket Panel:",
      error
    );

    if (!interaction.replied) {
      return interaction.reply({
        content:
          "❌ Gagal mempublish Ticket Panel.",
        ephemeral: true
      });
    }
  }
}

// =====================================================
// HANDLE EDITOR
// =====================================================

async function handleTicketEditor(
  interaction
) {

  // ===================================================
  // SLASH COMMAND
  // ===================================================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName ===
      "setup-ticket"
  ) {
    return showEditor(interaction);
  }

  // ===================================================
  // MODAL
  // ===================================================

  if (interaction.isModalSubmit()) {

    // ================================================
    // TEXT
    // ================================================

    if (
      interaction.customId ===
      "ticket_editor_text_modal"
    ) {
      const panel = loadPanel();

      panel.text =
        interaction.fields.getTextInputValue(
          "ticket_text_input"
        );

      savePanel(panel);

      return interaction.reply({
        content:
          "✅ Text Ticket Panel berhasil disimpan.",
        ephemeral: true
      });
    }

    // ================================================
    // BANNER
    // ================================================

    if (
      interaction.customId ===
      "ticket_editor_banner_modal"
    ) {
      const panel = loadPanel();

      panel.banner =
        interaction.fields.getTextInputValue(
          "ticket_banner_input"
        ).trim();

      savePanel(panel);

      return interaction.reply({
        content:
          panel.banner
            ? "✅ Banner berhasil disimpan."
            : "🗑️ Banner berhasil dikosongkan.",
        ephemeral: true
      });
    }

    // ================================================
    // FOOTER
    // ================================================

    if (
      interaction.customId ===
      "ticket_editor_footer_modal"
    ) {
      const panel = loadPanel();

      panel.footer =
        interaction.fields.getTextInputValue(
          "ticket_footer_input"
        );

      savePanel(panel);

      return interaction.reply({
        content:
          "✅ Footer Ticket Panel berhasil disimpan.",
        ephemeral: true
      });
    }

    return;
  }

  // ===================================================
  // BUTTON
  // ===================================================

  if (!interaction.isButton()) {
    return;
  }

  // ===================================================
  // EDIT TEXT
  // ===================================================

  if (
    interaction.customId ===
    "ticket_editor_text"
  ) {
    return showTextModal(interaction);
  }

  // ===================================================
  // EDIT BANNER
  // ===================================================

  if (
    interaction.customId ===
    "ticket_editor_banner"
  ) {
    return showBannerModal(interaction);
  }

  // ===================================================
  // EDIT FOOTER
  // ===================================================

  if (
    interaction.customId ===
    "ticket_editor_footer"
  ) {
    return showFooterModal(interaction);
  }

  // ===================================================
  // PREVIEW
  // ===================================================

  if (
    interaction.customId ===
    "ticket_editor_preview"
  ) {
    const panel = loadPanel();

    if (
      !panel.text.trim() &&
      !panel.banner.trim() &&
      !panel.footer.trim()
    ) {
      return interaction.reply({
        content:
          "⚠️ Panel masih kosong.",
        ephemeral: true
      });
    }

    const container =
      buildTicketPanel({
        includeButtons: true
      });

    return interaction.reply({
      components: [container],
      flags:
        MessageFlags.IsComponentsV2 |
        MessageFlags.Ephemeral
    });
  }

  // ===================================================
  // SAVE & PUBLISH
  // ===================================================

  if (
    interaction.customId ===
    "ticket_editor_save"
  ) {
    return publishTicketPanel(
      interaction
    );
  }

  // ===================================================
  // RESET
  // ===================================================

  if (
    interaction.customId ===
    "ticket_editor_reset"
  ) {
    resetPanel();

    return interaction.reply({
      content:
        "🗑️ Ticket Panel berhasil direset menjadi kosong.",
      ephemeral: true
    });
  }
}

// =====================================================
// HANDLE TICKET
// =====================================================

async function handleTicketFeature(
  interaction
) {

  // ===================================================
  // EDITOR
  // ===================================================

  if (
    interaction.isChatInputCommand() ||
    interaction.isModalSubmit()
  ) {
    return handleTicketEditor(
      interaction
    );
  }

  // ===================================================
  // BUTTON ONLY
  // ===================================================

  if (!interaction.isButton()) {
    return;
  }

  // ===================================================
  // EDITOR BUTTON
  // ===================================================

  if (
    interaction.customId.startsWith(
      "ticket_editor_"
    )
  ) {
    return handleTicketEditor(
      interaction
    );
  }

  // ===================================================
  // ORDER
  // ===================================================

  if (
    interaction.customId ===
    "ticket_buy"
  ) {
    try {
      const guild =
        interaction.guild;

      // ==============================================
      // EXISTING TICKET
      // ==============================================

      const existingTicket =
        guild.channels.cache.find(
          channel =>
            channel.type ===
              ChannelType.GuildText &&
            channel.topic ===
              `ticket-owner:${interaction.user.id}`
        );

      if (existingTicket) {
        return interaction.reply({
          content:
            `❌ Kamu sudah mempunyai ticket: ${existingTicket}`,
          ephemeral: true
        });
      }

      // ==============================================
      // FIND CATEGORY
      // ==============================================

      let category =
        guild.channels.cache.find(
          channel =>
            channel.type ===
              ChannelType.GuildCategory &&
            channel.name ===
              ORDER_CATEGORY_NAME
        );

      // ==============================================
      // CREATE CATEGORY
      // ==============================================

      if (!category) {
        category =
          await guild.channels.create({
            name:
              ORDER_CATEGORY_NAME,

            type:
              ChannelType.GuildCategory
          });

        await category.setPosition(0);
      }

      // ==============================================
      // USERNAME
      // ==============================================

      const username =
        interaction.user.username
          .toLowerCase()
          .replace(
            /[^a-z0-9-]/g,
            ""
          )
          .slice(0, 70);

      // ==============================================
      // CREATE TICKET
      // ==============================================

      const ticketChannel =
        await guild.channels.create({
          name:
            `order-${username}`,

          type:
            ChannelType.GuildText,

          parent:
            category.id,

          topic:
            `ticket-owner:${interaction.user.id}`,

          permissionOverwrites: [

            // EVERYONE
            {
              id:
                guild.roles.everyone.id,

              deny: [
                PermissionFlagsBits.ViewChannel
              ]
            },

            // CUSTOMER
            {
              id:
                interaction.user.id,

              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
              ]
            },

            // STAFF
            {
              id:
                STAFF_ROLE_ID,

              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageMessages
              ]
            },

            // FOUNDER
            {
              id:
                FOUNDER_ROLE_ID,

              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageMessages
              ]
            },

            // BOT
            {
              id:
                interaction.client.user.id,

              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageMessages
              ]
            }
          ]
        });

      // ==============================================
      // TICKET INFORMATION
      // ==============================================

      const ticketInfo =
        new ContainerBuilder()
          .setAccentColor(0xff8c00)

          .addTextDisplayComponents(
            text =>
              text.setContent(
                "# 🛒 MONROE ORDER\n\n" +

                `Halo ${interaction.user} 👋\n\n` +

                "Terima kasih telah membuat ticket.\n" +
                "Staff kami akan segera membantu pesanan kamu.\n\n" +

                "👤 **CUSTOMER**\n" +
                `${interaction.user}\n\n` +

                "🛡️ **STAFF**\n" +
                `<@&${STAFF_ROLE_ID}>\n\n` +

                "-# MONROE COMMUNITY © 2026"
              )
          )

          .addMediaGalleryComponents(
            gallery =>
              gallery.addItems(
                new MediaGalleryItemBuilder()
                  .setURL(
                    MONROE_LOGO
                  )
              )
          );

      await ticketChannel.send({
        components: [
          ticketInfo
        ],

        flags:
          MessageFlags.IsComponentsV2
      });

      // ==============================================
      // ORDER FORM
      // ==============================================

      await ticketChannel.send(
        "📋 **FORM PEMESANAN**\n\n" +

        "Nama        :\n" +
        "Produk/Jasa :\n" +
        "Jumlah      :\n" +
        "Pembayaran  :\n" +
        "Catatan     :\n\n" +

        "Silakan isi semua bagian di atas dengan lengkap."
      );

      // ==============================================
      // CLOSE BUTTON
      // ==============================================

      const closeRow =
        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId(
                "close_ticket"
              )

              .setLabel(
                "CLOSE TICKET"
              )

              .setEmoji("🔒")

              .setStyle(
                ButtonStyle.Danger
              )
          );

      await ticketChannel.send({
        components: [
          closeRow
        ]
      });

      // ==============================================
      // CONFIRMATION
      // ==============================================

      return interaction.reply({
        content:
          `✅ Ticket berhasil dibuat: ${ticketChannel}`,

        ephemeral: true
      });

    } catch (error) {

      console.error(
        "❌ Error membuat ticket:",
        error
      );

      if (
        !interaction.replied
      ) {
        return interaction.reply({
          content:
            "❌ Gagal membuat ticket. Pastikan bot mempunyai permission **Manage Channels**.",

          ephemeral: true
        });
      }
    }
  }

  // ===================================================
  // CONTACT STAFF
  // ===================================================

  if (
    interaction.customId ===
    "ticket_staff"
  ) {
    return interaction.reply({
      content:
        "💬 Gunakan tombol **ORDER** untuk membuat ticket dan menghubungi staff.",

      ephemeral: true
    });
  }

  // ===================================================
  // WARRANTY
  // ===================================================

  if (
    interaction.customId ===
    "ticket_warranty"
  ) {
    return interaction.reply({
      content:
        "🛡️ Untuk pengajuan garansi, gunakan tombol **ORDER** lalu jelaskan kendala kamu di dalam ticket.",

      ephemeral: true
    });
  }

  // ===================================================
  // CLOSE TICKET
  // ===================================================

  if (
    interaction.customId ===
    "close_ticket"
  ) {
    try {
      const channel =
        interaction.channel;

      // ==============================================
      // CHECK TICKET
      // ==============================================

      if (
        !channel.topic?.startsWith(
          "ticket-owner:"
        )
      ) {
        return interaction.reply({
          content:
            "❌ Ini bukan channel ticket.",

          ephemeral: true
        });
      }

      // ==============================================
      // OWNER
      // ==============================================

      const ownerId =
        channel.topic.split(":")[1];

      const member =
        interaction.member;

      // ==============================================
      // PERMISSION
      // ==============================================

      const allowed =
        interaction.user.id ===
          ownerId ||

        isStaff(member) ||

        member.permissions.has(
          PermissionFlagsBits.Administrator
        );

      if (!allowed) {
        return interaction.reply({
          content:
            "❌ Kamu tidak mempunyai izin untuk menutup ticket ini.",

          ephemeral: true
        });
      }

      // ==============================================
      // CLOSE
      // ==============================================

      await interaction.reply(
        "🔒 Ticket akan ditutup dalam **3 detik**..."
      );

      setTimeout(
        async () => {
          try {
            await channel.delete();
          } catch (error) {
            console.error(
              "❌ Gagal menghapus ticket:",
              error
            );
          }
        },
        3000
      );

    } catch (error) {
      console.error(
        "❌ Error close ticket:",
        error
      );
    }
  }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  sendTicketPanel,
  handleTicketFeature,
  handleTicketEditor,
  buildTicketPanel
};