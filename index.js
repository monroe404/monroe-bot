const express = require("express");

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  GUILD_ID
} = require("./config");

const {
  roleCommand,
  handleRoleFeature
} = require("./features/role");

const {
  sendTicketPanel,
  handleTicketFeature
} = require("./features/ticket");

const {
  handleModeration
} = require("./features/moderation");

const {
  handleAutoResponse
} = require("./features/autoResponse");

const {
  handleAI
} = require("./features/ai");

// =========================
// WEB SERVER
// =========================

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Monroe Bot is Online!");
});

app.listen(PORT, () => {
  console.log("🌐 Web server berjalan di port " + PORT);
});

// =========================
// DISCORD CLIENT
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
// BOT READY
// =========================

client.once("ready", async () => {
  console.log("================================");
  console.log("🤖 Bot login sebagai " + client.user.tag);
  console.log("================================");

  try {
    // Register /setup-role
    await client.application.commands.set(
      [roleCommand.toJSON()],
      GUILD_ID
    );

    console.log("✅ /setup-role berhasil didaftarkan.");
  } catch (error) {
    console.error(
      "❌ Gagal mendaftarkan slash command:",
      error
    );
  }

  // Kirim panel ticket jika belum ada
  await sendTicketPanel(client);
});

// =========================
// INTERACTIONS
// =========================

client.on("interactionCreate", async interaction => {
  try {
    // Role feature
    await handleRoleFeature(interaction);

    // Ticket feature
    await handleTicketFeature(interaction);

  } catch (error) {
    console.error(
      "❌ Interaction Error:",
      error
    );

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Terjadi kesalahan.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// =========================
// MESSAGE
// =========================

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  try {
    await handleAutoResponse(message);
    await handleModeration(message);
    await handleAi(message);
  } catch (error) {
    console.error(
      "❌ Message Error:",
      error
    );
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.DISCORD_TOKEN);