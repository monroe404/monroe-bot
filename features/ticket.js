const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits
} = require("discord.js");

const {
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID,
  ORDER_CATEGORY_NAME,
  TICKET_PANEL_CHANNEL_ID
} = require("../config");

// =========================
// STAFF CHECK
// =========================

function isStaff(member) {
  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID)
  );
}

// =========================
// TICKET PANEL
// =========================

async function sendTicketPanel(client) {
  try {
    const channel = await client.channels.fetch(
      TICKET_PANEL_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) return;

    const messages = await channel.messages.fetch({
      limit: 50
    });

    const alreadyExists = messages.some(
      message =>
        message.author.id === client.user.id &&
        message.flags.has(MessageFlags.IsComponentsV2)
    );

    if (alreadyExists) return;

    // =========================
    // BUTTONS
    // =========================

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

    const buttonRow = new ActionRowBuilder()
      .addComponents(
        orderButton,
        staffButton,
        warrantyButton
      );

    // =========================
    // MAIN CONTAINER
    // =========================

    const container = new ContainerBuilder()
      .setAccentColor(0xff8c00)

      .addTextDisplayComponents(
        text =>
          text.setContent(
            "# 🟧 MONROE COMMUNITY\n" +
            "## SUPPORT CENTER\n\n" +

            "Butuh bantuan atau ingin melakukan pemesanan?\n" +
            "Pilih kategori yang sesuai dengan kebutuhan kamu.\n\n" +

            "**🛒 ORDER**\n" +
            "Pembelian produk, jasa, atau layanan Monroe.\n\n" +

            "**💬 CONTACT STAFF**\n" +
            "Hubungi staff untuk pertanyaan atau bantuan.\n\n" +

            "**🛡️ WARRANTY**\n" +
            "Gunakan untuk kendala atau pengajuan garansi."
          )
      )

      .addSeparatorComponents(
        separator => separator
      )

      .addTextDisplayComponents(
        text =>
          text.setContent(
            "📌 Pilih kategori di bawah untuk membuat ticket.\n" +
            "🔒 Setiap ticket bersifat private.\n\n" +
            "-# MONROE COMMUNITY © 2026"
          )
      )

      .addActionRowComponents(buttonRow);

    await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
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

// =========================
// HANDLE TICKET
// =========================

async function handleTicketFeature(interaction) {
  if (!interaction.isButton()) return;

  // =========================
  // ORDER
  // =========================

  if (interaction.customId === "ticket_buy") {
    try {
      const guild = interaction.guild;

      // =========================
      // CHECK EXISTING TICKET
      // =========================

      const existingTicket = guild.channels.cache.find(
        channel =>
          channel.type === ChannelType.GuildText &&
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

      // =========================
      // CATEGORY
      // =========================

      let category = guild.channels.cache.find(
        channel =>
          channel.type === ChannelType.GuildCategory &&
          channel.name === ORDER_CATEGORY_NAME
      );

      if (!category) {
        category = await guild.channels.create({
          name: ORDER_CATEGORY_NAME,
          type: ChannelType.GuildCategory
        });

        await category.setPosition(0);
      }

      // =========================
      // USERNAME
      // =========================

      const username = interaction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 70);

      // =========================
      // CREATE TICKET
      // =========================

      const ticketChannel =
        await guild.channels.create({
          name: `order-${username}`,
          type: ChannelType.GuildText,
          parent: category.id,
          topic:
            `ticket-owner:${interaction.user.id}`,

          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [
                PermissionFlagsBits.ViewChannel
              ]
            },

            {
              id: interaction.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
              ]
            },

            {
              id: STAFF_ROLE_ID,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageMessages
              ]
            },

            {
              id: FOUNDER_ROLE_ID,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageMessages
              ]
            },

            {
              id: interaction.client.user.id,
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

      // =========================
      // TICKET OPEN INFO
      // COMPONENTS V2
      // =========================

      const ticketInfo = new ContainerBuilder()
        .setAccentColor(0xff8c00)

        .addTextDisplayComponents(
          text =>
            text.setContent(
              `# 🛒 MONROE ORDER\n\n` +

              `Halo ${interaction.user} 👋\n\n` +

              `Terima kasih telah membuat ticket.\n` +
              `Staff kami akan segera membantu pesanan kamu.\n\n` +

              `👤 **CUSTOMER**\n` +
              `${interaction.user}\n\n` +

              `🛡️ **STAFF**\n` +
              `<@&${STAFF_ROLE_ID}> <@&${FOUNDER_ROLE_ID}>\n\n` +

              `-# MONROE COMMUNITY © 2026`
            )
        );

      await ticketChannel.send({
        components: [ticketInfo],
        flags: MessageFlags.IsComponentsV2
      });

      // =========================
      // FORM PEMESANAN
      // PESAN BIASA
      // =========================

      await ticketChannel.send(
        "📋 **FORM PEMESANAN**\n\n" +
        "Nama        :\n" +
        "Produk/Jasa :\n" +
        "Jumlah      :\n" +
        "Pembayaran  :\n" +
        "Catatan     :\n\n" +
        "Silakan isi semua bagian di atas dengan lengkap."
      );

      // =========================
      // CLOSE BUTTON
      // PESAN BIASA
      // =========================

      const closeRow =
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("CLOSE TICKET")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
        );

      await ticketChannel.send({
        components: [closeRow]
      });

      // =========================
      // SUCCESS
      // =========================

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

      if (!interaction.replied) {
        return interaction.reply({
          content:
            "❌ Gagal membuat ticket. Pastikan bot mempunyai permission **Manage Channels**.",
          ephemeral: true
        });
      }
    }
  }

  // =========================
  // CONTACT STAFF
  // =========================

  if (interaction.customId === "ticket_staff") {
    return interaction.reply({
      content:
        "💬 Gunakan tombol **ORDER** untuk membuat ticket dan menghubungi staff.",
      ephemeral: true
    });
  }

  // =========================
  // WARRANTY
  // =========================

  if (interaction.customId === "ticket_warranty") {
    return interaction.reply({
      content:
        "🛡️ Untuk pengajuan garansi, gunakan tombol **ORDER** lalu jelaskan kendala kamu di dalam ticket.",
      ephemeral: true
    });
  }

  // =========================
  // CLOSE TICKET
  // =========================

  if (interaction.customId === "close_ticket") {
    try {
      const channel = interaction.channel;

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

      const ownerId =
        channel.topic.split(":")[1];

      const member = interaction.member;

      const allowed =
        interaction.user.id === ownerId ||
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

      await interaction.reply(
        "🔒 Ticket akan ditutup dalam **3 detik**..."
      );

      setTimeout(async () => {
        try {
          await channel.delete();
        } catch (error) {
          console.error(
            "❌ Gagal menghapus ticket:",
            error
          );
        }
      }, 3000);

    } catch (error) {
      console.error(
        "❌ Error close ticket:",
        error
      );
    }
  }
}

// =========================
// EXPORT
// =========================

module.exports = {
  sendTicketPanel,
  handleTicketFeature
};
