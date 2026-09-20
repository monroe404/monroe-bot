const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const {
  STAFF_ROLE_ID,
  FOUNDER_ROLE_ID,
  ORDER_CATEGORY_NAME,
  TICKET_PANEL_CHANNEL_ID
} = require("../config");

function isStaff(member) {
  return (
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(FOUNDER_ROLE_ID)
  );
}

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
        message.embeds[0]?.title ===
          "🟧 MONROE COMMUNITY STORE"
    );

    if (alreadyExists) return;

    const embed = new EmbedBuilder()
      .setColor(0xff8c00)
      .setTitle("🟧 MONROE COMMUNITY STORE")
      .setDescription(
        "🛒 **ORDER / PURCHASE**\n\n" +
        "Butuh membeli produk atau jasa?\n" +
        "Klik tombol di bawah untuk membuat ticket order.\n\n" +
        "📦 **PRODUCT**\n" +
        "💳 **PAYMENT**\n" +
        "🧾 **ORDER INFORMATION**\n" +
        "🛡️ **CUSTOMER SUPPORT**\n\n" +
        "━━━━━━━━━━━━━━━━━━━━\n\n" +
        "⚡ **Fast Response**\n" +
        "🔒 **Private Ticket**\n" +
        "💬 **Friendly Support**\n\n" +
        "MONROE COMMUNITY © 2026"
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_buy")
        .setLabel("BUY / ORDER")
        .setEmoji("🛒")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("ticket_staff")
        .setLabel("CONTACT STAFF")
        .setEmoji("📞")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("ticket_help")
        .setLabel("HELP")
        .setEmoji("❓")
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    console.log("✅ Panel Ticket berhasil dikirim.");
  } catch (error) {
    console.error("❌ Gagal mengirim Ticket Panel:", error);
  }
}

async function handleTicketFeature(interaction) {
  if (!interaction.isButton()) return;

  // =========================
  // BUY / ORDER
  // =========================

  if (interaction.customId === "ticket_buy") {
    try {
      const guild = interaction.guild;

      const existingTicket = guild.channels.cache.find(
        channel =>
          channel.type === ChannelType.GuildText &&
          channel.topic === `ticket-owner:${interaction.user.id}`
      );

      if (existingTicket) {
        return interaction.reply({
          content: `❌ Kamu sudah mempunyai ticket: ${existingTicket}`,
          ephemeral: true
        });
      }

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

        // Letakkan category di bagian atas
        await category.setPosition(0);
      }

      const username = interaction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 70);

      const ticketChannel = await guild.channels.create({
        name: `order-${username}`,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `ticket-owner:${interaction.user.id}`,

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

      // Pesan pembuka biasa, bukan embed
      await ticketChannel.send(
        `${interaction.user} <@&${STAFF_ROLE_ID}> <@&${FOUNDER_ROLE_ID}>\n\n` +
        `🛒 **MONROE ORDER**\n\n` +
        `Halo ${interaction.user}, silakan isi form pemesanan di bawah ini.`
      );

      // ORDER FORM PLAIN
      await ticketChannel.send(
        "📋 **FORM PEMESANAN**\n\n" +
        "Nama       :\n" +
        "Produk/Jasa :\n" +
        "Jumlah     :\n" +
        "Pembayaran :\n" +
        "Catatan    :\n\n" +
        "Silakan isi semua bagian di atas dengan lengkap."
      );

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("CLOSE TICKET")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        components: [closeRow]
      });

      return interaction.reply({
        content: `✅ Ticket berhasil dibuat: ${ticketChannel}`,
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Error membuat ticket:", error);

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
  // CLOSE TICKET
  // =========================

  if (interaction.customId === "close_ticket") {
    try {
      const channel = interaction.channel;

      if (!channel.topic?.startsWith("ticket-owner:")) {
        return interaction.reply({
          content: "❌ Ini bukan channel ticket.",
          ephemeral: true
        });
      }

      const ownerId = channel.topic.split(":")[1];
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
      console.error("❌ Error close ticket:", error);
    }
  }

  // =========================
  // CONTACT STAFF
  // =========================

  if (interaction.customId === "ticket_staff") {
    return interaction.reply({
      content:
        "📞 Silakan gunakan tombol **BUY / ORDER** untuk membuat ticket dan hubungi staff.",
      ephemeral: true
    });
  }

  // =========================
  // HELP
  // =========================

  if (interaction.customId === "ticket_help") {
    return interaction.reply({
      content:
        "❓ **HELP**\n\n" +
        "Gunakan **BUY / ORDER** untuk membuat ticket.\n" +
        "Jika membutuhkan bantuan, jelaskan masalah kamu di dalam ticket.",
      ephemeral: true
    });
  }
}

module.exports = {
  sendTicketPanel,
  handleTicketFeature
};