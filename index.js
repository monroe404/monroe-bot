const express = require("express");

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

// =========================
// WEB SERVER
// =========================

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Monroe Bot is Online!");
});

app.listen(PORT, () => {
  console.log("Web server berjalan di port " + PORT);
});

// =========================
// DISCORD
// =========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// CONFIG
// =========================

const GUILD_ID = "1502204899155247104";

const HUMAN_ROLE_ID = "1506592536372842517";

const STAFF_ROLE_ID = "1502205615685242880";

const FOUNDER_ROLE_ID = "1502205274205982801";

const TAKE_ROLE_CHANNEL_ID = "1505911450634289253";

const TICKET_PANEL_CHANNEL_ID = "1545815193332879430";

const ORDER_CATEGORY_NAME = "🛒・MONROE ORDERS";

// =========================
// ACCESS CHECK
// =========================

function isStaff(member) {
  return (
    member.roles.cache.has(FOUNDER_ROLE_ID) ||
    member.roles.cache.has(STAFF_ROLE_ID)
  );
}

// =========================
// TAKE ROLE PANEL
// =========================

async function sendTakeRolePanel() {
  try {
    const channel = await client.channels.fetch(
      TAKE_ROLE_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      console.log("❌ Channel Take Role tidak ditemukan.");
      return;
    }

    const messages = await channel.messages.fetch({
      limit: 50
    });

    const alreadyExists = messages.some(
      message =>
        message.author.id === client.user.id &&
        message.embeds[0]?.title === "🟧 MONROE COMMUNITY"
    );

    if (alreadyExists) {
      console.log("✅ Panel Take Role sudah ada.");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xff8c00)
      .setTitle("🟧 MONROE COMMUNITY")
      .setDescription(
        "👤 **MEMBER VERIFICATION**\n\n" +
        "Welcome to **Monroe Community**.\n\n" +
        "To access the server, please verify yourself\n" +
        "by clicking the button below.\n\n" +
        "🔓 **VERIFY YOURSELF**\n" +
        "Click the button below to receive your role.\n\n" +
        "MONROE COMMUNITY © 2026"
      );

    const button = new ButtonBuilder()
      .setCustomId("human_role")
      .setLabel("TAKE ROLE")
      .setEmoji("👤")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
      .addComponents(button);

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    console.log("✅ Panel Take Role berhasil dikirim.");

  } catch (error) {
    console.error("❌ Gagal mengirim Take Role:", error);
  }
}

// =========================
// TICKET PANEL
// =========================

async function sendTicketPanel() {
  try {
    const channel = await client.channels.fetch(
      TICKET_PANEL_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      console.log("❌ Channel Ticket tidak ditemukan.");
      return;
    }

    const messages = await channel.messages.fetch({
      limit: 50
    });

    const alreadyExists = messages.some(
      message =>
        message.author.id === client.user.id &&
        message.embeds[0]?.title ===
          "🟧 MONROE COMMUNITY STORE"
    );

    if (alreadyExists) {
      console.log("✅ Panel Ticket sudah ada.");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xff8c00)
      .setTitle("🟧 MONROE COMMUNITY STORE")
      .setDescription(
        "🛒 **ORDER / PURCHASE**\n\n" +
        "Butuh membeli produk atau jasa?\n" +
        "Klik tombol di bawah untuk membuat\n" +
        "ticket order secara otomatis.\n\n" +
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

    const row = new ActionRowBuilder()
      .addComponents(
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

// =========================
// BOT READY
// =========================

client.once("ready", async () => {
  console.log("================================");
  console.log("Bot login sebagai " + client.user.tag);
  console.log("================================");

  await sendTakeRolePanel();
  await sendTicketPanel();
});

// =========================
// BUTTON INTERACTION
// =========================

client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  // =========================
  // TAKE ROLE
  // =========================

  if (interaction.customId === "human_role") {
    try {
      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      const role = interaction.guild.roles.cache.get(
        HUMAN_ROLE_ID
      );

      if (!role) {
        return interaction.reply({
          content: "❌ Role Human tidak ditemukan.",
          ephemeral: true
        });
      }

      if (member.roles.cache.has(HUMAN_ROLE_ID)) {
        await member.roles.remove(role);

        return interaction.reply({
          content: "❌ Role **Human** dilepas.",
          ephemeral: true
        });
      }

      await member.roles.add(role);

      return interaction.reply({
        content: "✅ Role **Human** berhasil diberikan!",
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Error Take Role:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Terjadi kesalahan saat mengambil role.",
          ephemeral: true
        });
      }
    }
  }

  // =========================
  // BUY / ORDER
  // =========================

  if (interaction.customId === "ticket_buy") {
    try {
      const guild = interaction.guild;

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
      }

      const ticketChannel = await guild.channels.create({
        name:
          `order-${interaction.user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 80),

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
            id: client.user.id,
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
      // WELCOME MESSAGE
      // =========================

      const welcomeEmbed = new EmbedBuilder()
        .setColor(0xff8c00)
        .setTitle("🛒 MONROE ORDER CENTER")
        .setDescription(
          `Welcome ${interaction.user}!\n\n` +
          "Terima kasih telah melakukan order di **Monroe Community**.\n\n" +
          "Silakan isi **ORDER FORM** di bawah " +
          "dengan lengkap agar staff dapat memproses pesanan kamu.\n\n" +
          "🛡️ Staff akan membantu kamu setelah form dikirim."
        );

      await ticketChannel.send({
        content:
          `${interaction.user} <@&${STAFF_ROLE_ID}> <@&${FOUNDER_ROLE_ID}>`,

        embeds: [welcomeEmbed]
      });

      // =========================
      // ORDER FORM
      // =========================

      const formEmbed = new EmbedBuilder()
        .setColor(0xff8c00)
        .setTitle("📋 ORDER FORM")
        .setDescription(
          "**Buyer:**\n> Isi username Discord kamu\n\n" +

          "**Product:**\n> Produk / jasa yang ingin dibeli\n\n" +

          "**Quantity:**\n> Jumlah pesanan\n\n" +

          "**Payment:**\n> Metode pembayaran\n\n" +

          "**Notes:**\n> Catatan tambahan\n\n" +

          "━━━━━━━━━━━━━━━━━━━━\n\n" +

          "**FORMAT:**\n" +
          "```text\n" +
          "Buyer     :\n" +
          "Product   :\n" +
          "Quantity  :\n" +
          "Payment   :\n" +
          "Notes     :\n" +
          "```"
        );

      await ticketChannel.send({
        embeds: [formEmbed]
      });

      // =========================
      // CLOSE BUTTON
      // =========================

      const closeRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("CLOSE TICKET")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
        );

      await ticketChannel.send({
        components: [closeRow]
      });

      await interaction.reply({
        content:
          `✅ Ticket berhasil dibuat: ${ticketChannel}`,
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Error membuat ticket:", error);

      if (!interaction.replied) {
        await interaction.reply({
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
        "📞 Silakan buat ticket menggunakan tombol **BUY / ORDER**, lalu jelaskan kebutuhan kamu kepada staff.",
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
});

// =========================
// MODERATOR COMMANDS
// =========================

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  // =========================
  // AUTO RESPONSE
  // =========================

  const content = message.content.toLowerCase();

  if (content.includes("makasi") || content.includes("makasih")) {
    await message.reply("sama sama");
    return;
  }

  if (content.includes("rasya")) {
    await message.reply("iya tau Rasya emang ganteng");
    return;
  }

  // =========================
  // PREFIX COMMAND CHECK
  // =========================

  if (!content.startsWith("!")) return;

  if (!message.guild) return;

  const member = message.member;

  if (!isStaff(member)) {
    return message.reply(
      "❌ Kamu tidak mempunyai akses moderator."
    );
  }

  const args = message.content.trim().split(/\s+/);
  const command = args[0].toLowerCase();

  // =========================
  // !CLEAR
  // =========================

  if (command === "!clear") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Manage Messages**."
      );
    }

    const amount = parseInt(args[1]);

    if (!amount || amount < 1 || amount > 100) {
      return message.reply(
        "❌ Gunakan: `!clear 1-100`"
      );
    }

    await message.delete().catch(() => {});

    const deleted = await message.channel.bulkDelete(
      amount,
      true
    );

    const msg = await message.channel.send(
      `🧹 Berhasil menghapus **${deleted.size} pesan**.`
    );

    setTimeout(() => {
      msg.delete().catch(() => {});
    }, 3000);

    return;
  }

  // =========================
  // !KICKM
  // =========================

  if (command === "!kickm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Kick Members**."
      );
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply(
        "❌ Gunakan: `!kickm @member alasan`"
      );
    }

    const reason =
      args.slice(2).join(" ") || "Tidak ada alasan";

    if (!target.kickable) {
      return message.reply(
        "❌ Member tersebut tidak bisa di-kick."
      );
    }

    await target.kick(reason);

    return message.reply(
      `👢 **${target.user.tag}** berhasil di-kick.\nAlasan: ${reason}`
    );
  }

  // =========================
  // !BANM
  // =========================

  if (command === "!banm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.BanMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Ban Members**."
      );
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply(
        "❌ Gunakan: `!banm @member alasan`"
      );
    }

    const reason =
      args.slice(2).join(" ") || "Tidak ada alasan";

    if (!target.bannable) {
      return message.reply(
        "❌ Member tersebut tidak bisa di-ban."
      );
    }

    await target.ban({
      reason: reason
    });

    return message.reply(
      `🔨 **${target.user.tag}** berhasil di-ban.\nAlasan: ${reason}`
    );
  }

  // =========================
  // !TOM
  // =========================

  if (command === "!tom") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Moderate Members**."
      );
    }

    const target = message.mentions.members.first();
    const durationText = args[2];

    if (!target || !durationText) {
      return message.reply(
        "❌ Gunakan: `!tom @member 10m alasan`"
      );
    }

    const match = durationText.match(
      /^(\d+)(s|m|h|d)$/i
    );

    if (!match) {
      return message.reply(
        "❌ Format waktu: `10s`, `10m`, `2h`, atau `1d`."
      );
    }

    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    let duration;

    if (unit === "s") duration = amount * 1000;
    if (unit === "m") duration = amount * 60 * 1000;
    if (unit === "h") duration = amount * 60 * 60 * 1000;
    if (unit === "d") duration = amount * 24 * 60 * 60 * 1000;

    const maxDuration = 28 * 24 * 60 * 60 * 1000;

    if (duration > maxDuration) {
      return message.reply(
        "❌ Maksimal timeout adalah **28 hari**."
      );
    }

    const reason =
      args.slice(3).join(" ") || "Tidak ada alasan";

    if (!target.moderatable) {
      return message.reply(
        "❌ Member tersebut tidak bisa di-timeout."
      );
    }

    await target.timeout(duration, reason);

    return message.reply(
      `⏱️ **${target.user.tag}** mendapatkan timeout **${durationText}**.\nAlasan: ${reason}`
    );
  }

  // =========================
  // !LOCKM
  // =========================

  if (command === "!lockm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Manage Channels**."
      );
    }

    await message.channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    return message.reply(
      "🔒 Channel berhasil di-lock."
    );
  }

  // =========================
  // !UNLOCKM
  // =========================

  if (command === "!unlockm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Manage Channels**."
      );
    }

    await message.channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      {
        SendMessages: null
      }
    );

    return message.reply(
      "🔓 Channel berhasil di-unlock."
    );
  }

  // =========================
  // !WARNM
  // =========================

  if (command === "!warnm") {
    if (
      !member.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      return message.reply(
        "❌ Kamu tidak mempunyai permission **Moderate Members**."
      );
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply(
        "❌ Gunakan: `!warnm @member alasan`"
      );
    }

    const reason =
      args.slice(2).join(" ") || "Tidak ada alasan";

    return message.reply(
      `⚠️ **${target.user.tag}** mendapatkan peringatan.\nAlasan: ${reason}`
    );
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.DISCORD_TOKEN);