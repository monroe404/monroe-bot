const express = require("express");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
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

const ROLE_ID = "1506592536372842517";

const STAFF_ROLE_ID = "1502205615685242880";

const TICKET_PANEL_CHANNEL_ID = "1545815193332879430";

// =========================
// READY
// =========================

client.once("ready", async () => {
  console.log("Bot login sebagai " + client.user.tag);

  const commands = [
    new SlashCommandBuilder()
      .setName("setup-role")
      .setDescription("Mengirim panel Human Role."),

    new SlashCommandBuilder()
      .setName("setup-ticket")
      .setDescription("Mengirim panel Monroe Ticket.")
  ];

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      {
        body: commands.map(command => command.toJSON())
      }
    );

    console.log("Slash command berhasil didaftarkan.");
  } catch (error) {
    console.error(error);
  }
});

// =========================
// INTERACTION
// =========================

client.on("interactionCreate", async (interaction) => {

  // =========================
  // SLASH COMMAND
  // =========================

  if (interaction.isChatInputCommand()) {

    // =========================
    // SETUP ROLE
    // =========================

    if (interaction.commandName === "setup-role") {

      const embed = new EmbedBuilder()
        .setColor(0xff8c00)
        .setTitle("🟧 MONROE COMMUNITY")
        .setDescription(
          "👤 **MEMBER ROLE**\n\n" +
          "Need access?\n" +
          "Click the button below to get your role.\n\n" +
          "MONROE COMMUNITY © 2026"
        );

      const button = new ButtonBuilder()
        .setCustomId("human_role")
        .setLabel("TAKE ROLE")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder()
        .addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

      return;
    }

    // =========================
    // SETUP TICKET
    // =========================

    if (interaction.commandName === "setup-ticket") {

      const channel = interaction.guild.channels.cache.get(
        TICKET_PANEL_CHANNEL_ID
      );

      if (!channel) {
        return interaction.reply({
          content: "❌ Channel ticket tidak ditemukan.",
          ephemeral: true
        });
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

      await interaction.reply({
        content: "✅ Panel ticket berhasil dikirim.",
        ephemeral: true
      });

      return;
    }
  }

  // =========================
  // BUTTON
  // =========================

  if (!interaction.isButton()) return;

  // =========================
  // HUMAN ROLE
  // =========================

  if (interaction.customId === "human_role") {

    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(ROLE_ID);

    if (!role) {
      return interaction.reply({
        content: "❌ Role Human tidak ditemukan.",
        ephemeral: true
      });
    }

    try {

      if (member.roles.cache.has(ROLE_ID)) {

        await member.roles.remove(role);

        await interaction.reply({
          content: "❌ Role Human telah dilepas.",
          ephemeral: true
        });

      } else {

        await member.roles.add(role);

        await interaction.reply({
          content: "✅ Kamu berhasil mendapatkan role Human!",
          ephemeral: true
        });
      }

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content: "❌ Bot tidak bisa mengatur role.",
        ephemeral: true
      });
    }

    return;
  }

  // =========================
  // BUY / ORDER
  // =========================

  if (interaction.customId === "ticket_buy") {

    const guild = interaction.guild;

    const existingTicket = guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildText &&
        channel.topic === `ticket-owner:${interaction.user.id}`
    );

    if (existingTicket) {
      return interaction.reply({
        content: `❌ Kamu sudah memiliki ticket: ${existingTicket}`,
        ephemeral: true
      });
    }

    const panelChannel = guild.channels.cache.get(
      TICKET_PANEL_CHANNEL_ID
    );

    if (!panelChannel) {
      return interaction.reply({
        content: "❌ Channel ticket tidak ditemukan.",
        ephemeral: true
      });
    }

    try {

      const ticketChannel = await guild.channels.create({
        name: `order-${interaction.user.username}`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .slice(0, 90),

        type: ChannelType.GuildText,

        parent: panelChannel.parentId,

        topic: `ticket-owner:${interaction.user.id}`,

        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
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
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }
        ]
      });

      const ticketEmbed = new EmbedBuilder()
        .setColor(0xff8c00)
        .setTitle("🛒 MONROE ORDER CENTER")
        .setDescription(
          `👋 **Welcome, ${interaction.user}!**\n\n` +
          "Terima kasih telah melakukan order\n" +
          "di **Monroe Community.**\n\n" +
          "📋 **ORDER FORM**\n\n" +
          "👤 Buyer :\n" +
          "📦 Product :\n" +
          "🔢 Quantity :\n" +
          "💳 Payment :\n" +
          "📝 Notes :\n\n" +
          "━━━━━━━━━━━━━━━━━━━━\n\n" +
          "📌 Silakan isi format di atas.\n" +
          "Staff akan membantu memproses order kamu.\n\n" +
          "🟢 **STATUS : WAITING FOR ORDER**"
        )
        .setFooter({
          text: "MONROE COMMUNITY © 2026"
        });

      const closeButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("CLOSE TICKET")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
        );

      await ticketChannel.send({
        content: `${interaction.user} <@&${STAFF_ROLE_ID}>`,
        embeds: [ticketEmbed],
        components: [closeButton]
      });

      await interaction.reply({
        content: `✅ Ticket berhasil dibuat! ${ticketChannel}`,
        ephemeral: true
      });

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content:
          "❌ Gagal membuat ticket. Pastikan bot punya permission Manage Channels.",
        ephemeral: true
      });
    }

    return;
  }

  // =========================
  // CONTACT STAFF
  // =========================

  if (interaction.customId === "ticket_staff") {

    await interaction.reply({
      content:
        "📞 **Need something? We're here for you.**\n\n" +
        "Gunakan 🛒 **BUY / ORDER** untuk membuat ticket.",
      ephemeral: true
    });

    return;
  }

  // =========================
  // HELP
  // =========================

  if (interaction.customId === "ticket_help") {

    await interaction.reply({
      content:
        "❓ **Need help?**\n\n" +
        "🛒 BUY / ORDER — Membuat ticket order.\n" +
        "📞 CONTACT STAFF — Menghubungi staff.\n" +
        "🔒 CLOSE TICKET — Menutup ticket.",
      ephemeral: true
    });

    return;
  }

  // =========================
  // CLOSE TICKET
  // =========================

  if (interaction.customId === "ticket_close") {

    const member = interaction.member;

    const isStaff =
      member.roles.cache.has(STAFF_ROLE_ID) ||
      member.permissions.has(PermissionFlagsBits.Administrator);

    if (
      interaction.channel.topic !== `ticket-owner:${interaction.user.id}` &&
      !isStaff
    ) {
      return interaction.reply({
        content: "❌ Kamu tidak memiliki akses untuk menutup ticket ini.",
        ephemeral: true
      });
    }

    await interaction.reply(
      "🔒 Ticket akan ditutup dalam 3 detik..."
    );

    setTimeout(async () => {

      try {
        await interaction.channel.delete();
      } catch (error) {
        console.error(error);
      }

    }, 3000);

    return;
  }
});

// =========================
// AUTO RESPONSE
// =========================

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  const text = message.content.toLowerCase();

  if (text.includes("makasi") || text.includes("makasih")) {
    await message.reply("sama sama");
    return;
  }

  if (text.includes("rasya")) {
    await message.reply("iya tau Rasya emang ganteng");
    return;
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.DISCORD_TOKEN);